const { expect } = require('chai');
import { ethers } from 'hardhat';
import { Contract, utils  } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const snft_initial_price = 0.05;	// In ETH

const mint_amount_alice = 1;
const mint_amount_bob = 20;
const mint_amount_carol = 5;

describe(`2) Deploy sNFT contract and make simple interactions -- Mint - Redeem - Approve`, () => {
	let owner: SignerWithAddress;
	let alice: SignerWithAddress, bob: SignerWithAddress, carol: SignerWithAddress;

	let sNFT: Contract;

	let price;

	describe(`General`, () => {
		it(`Should init Signers`, async () => {
			[owner, alice, bob, carol] = await ethers.getSigners();
		});
		it(`Should deploy the SNFT contract`, async () => {
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
			await sNFT.connect(bob).mint( mint_amount_bob, { value: ethers.utils.parseEther(`${mint_amount_bob * price}`) } );
			expect(await sNFT.totalActive()).to.equal(mint_amount_alice+mint_amount_bob);
		});
		it(`Should Bob Redeem 1 of its sNFT`, async () => {
			await sNFT.connect(bob).redeem(3);
		});
		it(`Should Carol Mint ${mint_amount_carol} sNFT`, async () => {
			price = Number(ethers.utils.formatEther(await sNFT.actualPrice()));
			await sNFT.connect(carol).mint( mint_amount_carol, { value: ethers.utils.parseEther(`${mint_amount_carol * price}`) } );
		});

		it(`Should Not Allow Alice Redeem 1 sNFT of Carol`, async () => {
			await expect(sNFT.connect(alice).redeem(24)).to.be.revertedWith('Not approved to redeem');
		});

		it(`Should Allow Alice Redeem 1 sNFT of Carol (after approve)`, async () => {
			await sNFT.connect(carol).approve(alice.address, 24);
			await sNFT.connect(alice).redeem(24);
		});
	});
});