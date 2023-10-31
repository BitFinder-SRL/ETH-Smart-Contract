// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDTMock is ERC20, Ownable {
    constructor() ERC20("Tether USD", "USDT") {
        _mint(owner(), 83191016572 * 10 ** decimals());
    }
}