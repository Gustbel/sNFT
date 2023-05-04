const { expect } = require('chai');
import { ethers } from 'hardhat';
import { Contract, utils  } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const snft_initial_price = 0.05;	// In ETH

const mint_amount_alice = 1;
const mint_amount_bob = 20;

describe(`1) Deploy sNFT contract and make simple interactions -- Mint`, () => {
	let owner: SignerWithAddress;
	let alice: SignerWithAddress, bob: SignerWithAddress;

	let sNFT: Contract;

	let price;

	describe(`General`, () => {
		it(`Should init Signers`, async () => {
			[owner, alice, bob] = await ethers.getSigners();
		});
		it(`Should deploy the ERC20`, async () => {
			let SNFT = await ethers.getContractFactory("sNFT");
			sNFT = await SNFT.deploy(ethers.utils.parseEther(snft_initial_price.toString()));
		});
		it(`Should Alice Mint ${mint_amount_alice} sNFT`, async () => {
			price = Number(ethers.utils.formatEther(await sNFT.actualPrice()));
			await sNFT.connect(alice).mint( mint_amount_alice, { value: ethers.utils.parseEther(`${mint_amount_alice * price}`) } );
			expect(await sNFT.totalActive()).to.equal(mint_amount_alice);
		});
		it(`Should BOB Mint ${mint_amount_bob} sNFT`, async () => {
			price = Number(ethers.utils.formatEther(await sNFT.actualPrice()));
			await sNFT.connect(alice).mint( mint_amount_bob, { value: ethers.utils.parseEther(`${mint_amount_bob * price}`) } );
			expect(await sNFT.totalActive()).to.equal(mint_amount_alice+mint_amount_bob);
		});
	});
});