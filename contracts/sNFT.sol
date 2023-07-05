// SPDX-License-Identifier: MIT

// sNFT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/ERC721.sol";
import "./lib/ERC721Enumerable.sol";

contract sNFT is ERC721Enumerable, Ownable {
    uint8 public maxFactor = 100;
    mapping(uint256 => bool) private _tokenActive;

    // Price
    uint256 public price;

    // Factor
    uint8 public factor;

    // Max Supply
    uint256 public maxSupply;
    
    // Base URI
    string private _baseURIextended;

    // Amount of active sNFTs
    uint256 public totalActive;

    constructor(
        uint256 initialPrice, 
        uint8 initialFactor, 
        uint256 initialMaxSupply
    ) ERC721("Staked NFT", "sNFT") {
        unchecked {
            require(initialFactor <= maxFactor, "Factor must be lower than maxFactor");
        }
        price = initialPrice;
        factor = initialFactor;
        maxSupply = initialMaxSupply;
    }

    function mint(uint32 count) external payable {
        require(msg.value >= price * count, "Insufficient funds!");
        require(count < 101, "Exceeds max per transaction.");
        
        uint256 nextTokenId = _owners.length;
        unchecked {
            require(nextTokenId + count < maxSupply, "Exceeds max supply.");
        }

        for (uint32 i; i < count;) {
            _mint(_msgSender(), nextTokenId);
            _tokenActive[nextTokenId] = true;
            unchecked { ++nextTokenId; ++i; }
            totalActive++;
        }

        // Not necessary update price in mint (it's the same)
    }

    function lock(uint256 tokenId) public {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not approved to lock");
        require(_tokenActive[tokenId] == true, "This Asset is already locked");
        require(totalActive > 1, "Must be at least one sNFT active in the contract for safety");

        _tokenActive[tokenId] = false;

        // Return money to token owner
        uint256 payableAmount = (price * factor) / maxFactor;
        (bool os,)=  ERC721.ownerOf(tokenId).call{value: payableAmount}("");
        require(os);
        --totalActive;

        // New Price calculation
        updatePrice();
    }

    function unlock(uint256 tokenId) external payable {
        require(msg.value >= price, "Insufficient funds!");
        require(_tokenActive[tokenId] == false, "This Asset is already unlocked");

        _tokenActive[tokenId] = true;
        ++totalActive;

        // Not necessary update price in unlock (it's the same)
    }

    function shareRevenue() external payable {
        // New Price calculation
        updatePrice();
    }

    function updatePrice() internal {
        price = address(this).balance / totalActive;
    }

    function setMaxSupply(uint256 newMaxSupply) external onlyOwner() {
        require(maxSupply < newMaxSupply, "newMaxSupply cannot be lower than actual maxSupply");    // TODO: Maybe is better that newMaxSupply > Higher Token ID
        maxSupply = newMaxSupply;
    }

/*
    function withdraw() external payable onlyOwner {
        (bool os,)= payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not approved to burn.");
        _burn(tokenId);
    }
*/

    function totalFunded() public view returns (uint256) {
        return address(this).balance;
    }

    function actualPrice() public view returns (uint256) {
        return price;
    }

    function isActive(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Nonexistent token");
        return _tokenActive[tokenId];
    }

    function setBaseURI(string memory baseURI_) external onlyOwner() {
        _baseURIextended = baseURI_;
    }

    function _baseURI() internal view virtual returns (string memory) {
        return _baseURIextended;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory base = _baseURI();
        require(bytes(base).length != 0, "Base URI nonexistent");
        
        // Concatenate the tokenID to the baseURI.
        return string(abi.encodePacked(base, Strings.toString(tokenId)));
    }
}