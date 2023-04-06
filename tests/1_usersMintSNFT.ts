const { expect } = require('chai');
import { ethers } from 'hardhat';
import { Contract, utils  } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const sNFT_initialPrice = 0.05;
const mint_amount_alice = 1;
const mint_amount_bob = 20;

describe(`Deploy sNFT contract`, () => {
	let owner: SignerWithAddress;
	let alice: SignerWithAddress, bob: SignerWithAddress;

	let sNFT: Contract;

	describe(`1) Init Signets and Instance all the contracts`, () => {
		it(`Should init Signers`, async () => {
			[owner, alice, bob] = await ethers.getSigners();
		});
		it(`Should deploy the ERC20`, async () => {
			let SNFT = await ethers.getContractFactory("sNFT");
			sNFT = await SNFT.deploy();
		});
		it(`Should Alice Mint ${mint_amount_alice} sNFT`, async () => {
			await sNFT.connect(alice).mint( mint_amount_alice, { value: ethers.utils.parseEther(`${mint_amount_alice * sNFT_initialPrice}`) } );
			expect(await sNFT.activeAmount()).to.equal(mint_amount_alice);
		});
		it(`Should BOB Mint ${mint_amount_bob} sNFT`, async () => {
			await sNFT.connect(alice).mint( mint_amount_bob, { value: ethers.utils.parseEther(`${mint_amount_bob * sNFT_initialPrice}`) } );
			expect(await sNFT.activeAmount()).to.equal(mint_amount_alice+mint_amount_bob);
		});
		it(`Should totalSupply() be equal to the ingresed Ether value`, async () => {
			let totalSupply = await sNFT.totalSupply();
    		expect(await totalSupply).to.equal( 
				ethers.utils.parseEther(`${(mint_amount_alice+mint_amount_bob) * sNFT_initialPrice}`));
		});
	});
});