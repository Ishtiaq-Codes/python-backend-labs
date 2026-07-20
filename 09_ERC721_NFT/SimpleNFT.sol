// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleNFT {
    string public name = "SimpleNFT";
    string public symbol = "SNFT";
    
    uint256 private _nextTokenId;
    mapping(uint256 => address) private _owners;
    mapping(uint256 => string) private _tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function mintNFT(address to, string memory uri) public {
        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = to;
        _tokenURIs[tokenId] = uri;
        
        emit Transfer(address(0), to, tokenId);
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
}
