// SPDX-License-Identifier: MIT

// sNFT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/ERC721Enumerable.sol";

contract sNFT is ERC721Enumerable, Ownable {
    uint256 public maxSupply = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;  // Infinite Supply
    
    // Price
    uint256 public price;
    
    // Base URI
    string private _baseURIextended;

    constructor() ERC721("Staked NFT", "sNFT") {
        price = 50000000000000000;
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
            unchecked { ++nextTokenId; ++i; }
        }
    }

    function withdraw() external payable onlyOwner {
        (bool os,)= payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not approved to burn.");
        _burn(tokenId);
    }

    function totalSupply() public view override returns (uint256) {
        return address(this).balance;
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