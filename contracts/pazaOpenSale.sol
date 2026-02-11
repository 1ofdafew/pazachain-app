// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

interface IPAZAToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function freeze(address account, uint256 amount) external;
    function unfreeze(address account, uint256 amount) external;
}

contract PAZAOpenSale is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /*//////////////////////////////////////////////////////////////
                                ROLES
    //////////////////////////////////////////////////////////////*/
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant STABLECOIN_MANAGER_ROLE =
        keccak256("STABLECOIN_MANAGER_ROLE");

    /*//////////////////////////////////////////////////////////////
                            SALE PARAMETERS
    //////////////////////////////////////////////////////////////*/
    uint256 public constant PAZA_DECIMALS = 6;
    uint256 public constant PRICE = 17_000; // $0.017 per PAZA in 6 decimals
    uint256 public constant MIN_PURCHASE_USD = 5 * 1e6; // $5 minimum in 6 decimals
    uint256 public constant MAX_PURCHASE_USD = 1_000_000 * 1e6; // $1M maximum in 6 decimals

    uint256 public totalSold;
    uint256 public saleCap; // Total cap in PAZA tokens
    bool public saleActive;

    /*//////////////////////////////////////////////////////////////
                            STABLECOIN SUPPORT
    //////////////////////////////////////////////////////////////*/
    enum Stablecoin {
        PUSD,
        USDT,
        USDC
    }

    struct StablecoinInfo {
        IERC20Upgradeable token;
        uint8 decimals;
        bool enabled;
        address treasury;
    }

    Stablecoin public defaultStablecoin;
    mapping(Stablecoin => StablecoinInfo) public stablecoins;

    // Vesting contract
    IPAZAToken public paza;

    /*//////////////////////////////////////////////////////////////
                            USER CAP & WHITELIST
    //////////////////////////////////////////////////////////////*/
    uint256 public userGlobalCap;
    mapping(address => uint256) public userTotalPurchased;

    // Whitelist mechanism
    bool public whitelistEnabled;
    mapping(address => bool) public whitelist;

    // Emergency refund system
    bool public emergencyStopped;
    mapping(address => mapping(Stablecoin => uint256))
        public emergencyRefundAmounts;
    mapping(address => uint256) public userPurchasedForRefund;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event SaleInitialized(uint256 cap, uint256 price);
    event SaleToggled(bool active);
    event SaleCapSet(uint256 newCap);

    event TokensPurchased(
        address indexed buyer,
        Stablecoin indexed stablecoin,
        uint256 stablecoinAmount,
        uint256 usdValue,
        uint256 tokenAmount
    );

    event UserGlobalCapSet(uint256 newCap);
    event WhitelistToggled(bool enabled);
    event WhitelistAddressAdded(address indexed account);
    event WhitelistAddressRemoved(address indexed account);
    event EmergencyStopped(address indexed by);
    event EmergencyResumed(address indexed by);
    event EmergencyRefunded(
        address indexed user,
        Stablecoin indexed stablecoin,
        uint256 stablecoinAmount,
        uint256 tokenAmount
    );
    event StablecoinConfigured(
        Stablecoin indexed stablecoin,
        address token,
        uint8 decimals,
        bool enabled,
        address treasury
    );
    event DefaultStablecoinSet(Stablecoin indexed stablecoin);
    event StablecoinTreasuryUpdated(
        Stablecoin indexed stablecoin,
        address newTreasury
    );
    event PAZAUpdated(address indexed newPAZA);
    event TokensRecovered(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    /*//////////////////////////////////////////////////////////////
                                INIT
    //////////////////////////////////////////////////////////////*/
    function initialize(
        address pusd_,
        address usdt_,
        address usdc_,
        address paza_,
        address treasury_,
        uint256 cap_ // Total sale cap in PAZA tokens
    ) external initializer {
        require(pusd_ != address(0), "PUSD address zero");
        require(paza_ != address(0), "PAZA address zero");
        require(treasury_ != address(0), "Treasury address zero");
        require(cap_ > 0, "Cap must be positive");

        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(STABLECOIN_MANAGER_ROLE, msg.sender);

        // Initialize PUSD (required)
        uint8 pusdDecimals = IERC20MetadataUpgradeable(pusd_).decimals();
        require(pusdDecimals == 6, "PUSD must be 6 decimals");
        stablecoins[Stablecoin.PUSD] = StablecoinInfo({
            token: IERC20Upgradeable(pusd_),
            decimals: pusdDecimals,
            enabled: true,
            treasury: treasury_
        });

        // Initialize USDT if provided
        if (usdt_ != address(0)) {
            uint8 usdtDecimals = IERC20MetadataUpgradeable(usdt_).decimals();
            require(usdtDecimals == 6, "USDT must be 6 decimals");
            stablecoins[Stablecoin.USDT] = StablecoinInfo({
                token: IERC20Upgradeable(usdt_),
                decimals: usdtDecimals,
                enabled: true,
                treasury: treasury_
            });
        }

        // Initialize USDC if provided
        if (usdc_ != address(0)) {
            uint8 usdcDecimals = IERC20MetadataUpgradeable(usdc_).decimals();
            require(usdcDecimals == 6, "USDC must be 6 decimals");
            stablecoins[Stablecoin.USDC] = StablecoinInfo({
                token: IERC20Upgradeable(usdc_),
                decimals: usdcDecimals,
                enabled: true,
                treasury: treasury_
            });
        }

        paza = IPAZAToken(paza_);
        defaultStablecoin = Stablecoin.PUSD;
        saleCap = cap_;
        saleActive = true;

        whitelistEnabled = false;
        emergencyStopped = false;

        emit SaleInitialized(cap_, PRICE);
        emit SaleToggled(true);
    }

    /*//////////////////////////////////////////////////////////////
                            SALE CONTROLS
    //////////////////////////////////////////////////////////////*/
    function toggleSale(bool active) external onlyRole(ADMIN_ROLE) {
        saleActive = active;
        emit SaleToggled(active);
    }

    function setSaleCap(uint256 cap) external onlyRole(ADMIN_ROLE) {
        require(cap > 0, "Zero cap");
        require(cap >= totalSold, "Cap below sold amount");
        saleCap = cap;
        emit SaleCapSet(cap);
    }

    /*//////////////////////////////////////////////////////////////
                            STABLECOIN MANAGEMENT
    //////////////////////////////////////////////////////////////*/
    function configureStablecoin(
        Stablecoin stablecoin,
        address token,
        bool enabled,
        address treasury_
    ) external onlyRole(STABLECOIN_MANAGER_ROLE) {
        require(token != address(0), "Token address zero");
        require(treasury_ != address(0), "Treasury address zero");

        uint8 tokenDecimals = IERC20MetadataUpgradeable(token).decimals();
        require(tokenDecimals == 6, "Stablecoin must be 6 decimals");

        stablecoins[stablecoin] = StablecoinInfo({
            token: IERC20Upgradeable(token),
            decimals: tokenDecimals,
            enabled: enabled,
            treasury: treasury_
        });

        emit StablecoinConfigured(
            stablecoin,
            token,
            tokenDecimals,
            enabled,
            treasury_
        );
    }

    function setStablecoinEnabled(
        Stablecoin stablecoin,
        bool enabled
    ) external onlyRole(STABLECOIN_MANAGER_ROLE) {
        require(
            address(stablecoins[stablecoin].token) != address(0),
            "Stablecoin not configured"
        );
        stablecoins[stablecoin].enabled = enabled;
        emit StablecoinConfigured(
            stablecoin,
            address(stablecoins[stablecoin].token),
            stablecoins[stablecoin].decimals,
            enabled,
            stablecoins[stablecoin].treasury
        );
    }

    function setStablecoinTreasury(
        Stablecoin stablecoin,
        address treasury_
    ) external onlyRole(STABLECOIN_MANAGER_ROLE) {
        require(
            address(stablecoins[stablecoin].token) != address(0),
            "Stablecoin not configured"
        );
        require(treasury_ != address(0), "Treasury address zero");
        stablecoins[stablecoin].treasury = treasury_;
        emit StablecoinTreasuryUpdated(stablecoin, treasury_);
    }

    function setDefaultStablecoin(
        Stablecoin stablecoin
    ) external onlyRole(STABLECOIN_MANAGER_ROLE) {
        require(
            address(stablecoins[stablecoin].token) != address(0),
            "Stablecoin not configured"
        );
        require(stablecoins[stablecoin].enabled, "Stablecoin disabled");
        defaultStablecoin = stablecoin;
        emit DefaultStablecoinSet(stablecoin);
    }

    function getStablecoinInfo(
        Stablecoin stablecoin
    )
        external
        view
        returns (address token, uint8 decimals, bool enabled, address treasury)
    {
        StablecoinInfo storage info = stablecoins[stablecoin];
        return (
            address(info.token),
            info.decimals,
            info.enabled,
            info.treasury
        );
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN CONTROLS
    //////////////////////////////////////////////////////////////*/
    function setUserGlobalCap(uint256 cap) external onlyRole(ADMIN_ROLE) {
        require(
            cap >= (MIN_PURCHASE_USD * 10 ** PAZA_DECIMALS) / PRICE,
            "Cap too low for min purchase"
        );
        userGlobalCap = cap;
        emit UserGlobalCapSet(cap);
    }

    function setPazaAddress(address newPAZA) external onlyRole(ADMIN_ROLE) {
        require(newPAZA != address(0), "PAZA address zero");
        paza = IPAZAToken(newPAZA);
        emit PAZAUpdated(newPAZA);
    }

    /*//////////////////////////////////////////////////////////////
                            WHITELIST CONTROLS
    //////////////////////////////////////////////////////////////*/
    function setWhitelistEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        whitelistEnabled = enabled;
        emit WhitelistToggled(enabled);
    }

    function addToWhitelist(address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "Account address zero");
        require(!whitelist[account], "Already whitelisted");
        whitelist[account] = true;
        emit WhitelistAddressAdded(account);
    }

    function addMultipleToWhitelist(
        address[] calldata accounts
    ) external onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < accounts.length; i++) {
            require(accounts[i] != address(0), "Account address zero");
            if (!whitelist[accounts[i]]) {
                whitelist[accounts[i]] = true;
                emit WhitelistAddressAdded(accounts[i]);
            }
        }
    }

    function removeFromWhitelist(
        address account
    ) external onlyRole(ADMIN_ROLE) {
        require(whitelist[account], "Not whitelisted");
        whitelist[account] = false;
        emit WhitelistAddressRemoved(account);
    }

    /*//////////////////////////////////////////////////////////////
                            EMERGENCY CONTROLS
    //////////////////////////////////////////////////////////////*/
    function emergencyStop() external onlyRole(EMERGENCY_ROLE) {
        require(!emergencyStopped, "Already stopped");
        emergencyStopped = true;
        emit EmergencyStopped(msg.sender);
    }

    function emergencyResume() external onlyRole(EMERGENCY_ROLE) {
        require(emergencyStopped, "Not stopped");
        emergencyStopped = false;
        emit EmergencyResumed(msg.sender);
    }

    function emergencyRefund(
        address user,
        Stablecoin stablecoin
    ) external onlyRole(EMERGENCY_ROLE) nonReentrant {
        require(emergencyStopped, "Not in emergency");
        require(user != address(0), "User address zero");
        require(stablecoins[stablecoin].enabled, "Stablecoin disabled");

        uint256 purchasedAmount = userPurchasedForRefund[user];
        require(purchasedAmount > 0, "No purchase to refund");

        // Calculate USD value to refund
        uint256 usdValue = (purchasedAmount * PRICE) / (10 ** PAZA_DECIMALS);
        require(usdValue > 0, "Zero refund amount");

        // Convert USD value to stablecoin amount (1:1 as both are 6 decimals)
        uint256 stablecoinAmount = usdValue;
        StablecoinInfo storage scInfo = stablecoins[stablecoin];

        require(
            scInfo.token.balanceOf(address(this)) >= stablecoinAmount,
            "Insufficient contract balance"
        );

        // Update state
        userPurchasedForRefund[user] = 0;
        userTotalPurchased[user] -= purchasedAmount;
        totalSold -= purchasedAmount;

        // Track refund
        emergencyRefundAmounts[user][stablecoin] += stablecoinAmount;

        // Transfer refund
        scInfo.token.safeTransfer(user, stablecoinAmount);

        emit EmergencyRefunded(
            user,
            stablecoin,
            stablecoinAmount,
            purchasedAmount
        );
    }

    /*//////////////////////////////////////////////////////////////
                            TOKEN RECOVERY
    //////////////////////////////////////////////////////////////*/
    function recoverTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Recipient address zero");
        require(amount > 0, "Zero amount");

        // Check if token is one of the supported stablecoins
        bool isSupportedStablecoin = false;
        Stablecoin stablecoinType;

        for (uint8 i = 0; i <= uint8(type(Stablecoin).max); i++) {
            Stablecoin sc = Stablecoin(i);
            if (address(stablecoins[sc].token) == token) {
                isSupportedStablecoin = true;
                stablecoinType = sc;
                break;
            }
        }

        // Prevent recovering supported stablecoins during emergency stop
        if (isSupportedStablecoin) {
            require(
                !emergencyStopped,
                "Cannot recover stablecoins during emergency"
            );
            require(
                amount <=
                    IERC20Upgradeable(token).balanceOf(address(this)) -
                        _totalPotentialRefunds(stablecoinType),
                "Insufficient balance after refunds"
            );
        }

        IERC20Upgradeable(token).safeTransfer(to, amount);
        emit TokensRecovered(token, to, amount);
    }

    function _totalPotentialRefunds(
        Stablecoin stablecoin
    ) internal view returns (uint256) {
        IERC20Upgradeable token = stablecoins[stablecoin].token;
        if (address(token) == address(0)) return 0;
        return (token.balanceOf(address(this)) * 10) / 100; // Assume 10% buffer
    }

    /*//////////////////////////////////////////////////////////////
                            PAUSE CONTROLS
    //////////////////////////////////////////////////////////////*/
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function isWhitelisted(address account) external view returns (bool) {
        return !whitelistEnabled || whitelist[account];
    }

    function getPrice() external pure returns (uint256) {
        return PRICE;
    }

    function calculateTokenAmount(
        uint256 stablecoinAmount,
        Stablecoin stablecoin
    ) public view returns (uint256 tokenAmount, uint256 usdValue) {
        require(stablecoins[stablecoin].enabled, "Stablecoin disabled");
        require(stablecoinAmount > 0, "Zero amount");

        // Convert stablecoin amount to USD value (both are 6 decimals)
        usdValue = stablecoinAmount;

        // Calculate token amount
        tokenAmount = (usdValue * (10 ** PAZA_DECIMALS)) / PRICE;
    }

    /*//////////////////////////////////////////////////////////////
                            SALE LOGIC
    //////////////////////////////////////////////////////////////*/
    function buy(
        uint256 stablecoinAmount,
        Stablecoin stablecoin
    ) external whenNotPaused nonReentrant {
        _buyInternal(stablecoinAmount, stablecoin);
    }

    function buy(uint256 stablecoinAmount) external whenNotPaused nonReentrant {
        _buyInternal(stablecoinAmount, defaultStablecoin);
    }

    function _buyInternal(
        uint256 stablecoinAmount,
        Stablecoin stablecoin
    ) internal {
        require(!emergencyStopped, "Emergency stop active");
        require(saleActive, "Sale not active");
        require(stablecoins[stablecoin].enabled, "Stablecoin disabled");
        require(stablecoinAmount >= MIN_PURCHASE_USD, "Below minimum");
        require(stablecoinAmount <= MAX_PURCHASE_USD, "Above maximum");

        // Whitelist check
        if (whitelistEnabled) {
            require(whitelist[msg.sender], "Not whitelisted");
        }

        // Calculate token amount
        uint256 usdValue = stablecoinAmount;
        require(
            usdValue <= type(uint256).max / (10 ** PAZA_DECIMALS),
            "Amount too large"
        );

        uint256 tokenAmount = (usdValue * (10 ** PAZA_DECIMALS)) / PRICE;
        require(tokenAmount > 0, "Too small");

        // Check total cap
        require(totalSold + tokenAmount <= saleCap, "Total cap exceeded");
        require(totalSold + tokenAmount > totalSold, "Overflow check");

        // Check user caps
        if (userGlobalCap > 0) {
            require(
                userTotalPurchased[msg.sender] + tokenAmount <= userGlobalCap,
                "User cap exceeded"
            );
            require(
                userTotalPurchased[msg.sender] + tokenAmount >
                    userTotalPurchased[msg.sender],
                "Overflow check"
            );
        }

        // EFFECTS
        totalSold += tokenAmount;
        userTotalPurchased[msg.sender] += tokenAmount;
        userPurchasedForRefund[msg.sender] += tokenAmount;

        // INTERACTIONS
        StablecoinInfo storage scInfo = stablecoins[stablecoin];

        // Transfer stablecoin from user to contract
        scInfo.token.safeTransferFrom(
            msg.sender,
            address(this),
            stablecoinAmount
        );

        // Transfer to treasury
        scInfo.token.safeTransfer(scInfo.treasury, stablecoinAmount);

        // Create vesting grant
        paza.mint(msg.sender, tokenAmount);

        emit TokensPurchased(
            msg.sender,
            stablecoin,
            stablecoinAmount,
            usdValue,
            tokenAmount
        );
    }

    /*//////////////////////////////////////////////////////////////
                        UUPS AUTHORIZATION
    //////////////////////////////////////////////////////////////*/
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    /*//////////////////////////////////////////////////////////////
                            STORAGE GAP
    //////////////////////////////////////////////////////////////*/
    uint256[50] private __gap;
}
