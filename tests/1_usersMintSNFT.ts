const { expect } = require('chai');
import { ethers } from 'hardhat';
import { Contract, utils  } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const mint_amount_alice = 1;
const mint_amount_bob = 20;

describe(`Deploy sNFT contract`, () => {
	let owner: SignerWithAddress;
	let alice: SignerWithAddress, bob: SignerWithAddress;

	let sNFT: Contract;

	let price;

	describe(`1) Init Signets and Instance all the contracts`, () => {
		it(`Should init Signers`, async () => {
			[owner, alice, bob] = await ethers.getSigners();
		});
		it(`Should deploy the ERC20`, async () => {
			let SNFT = await ethers.getContractFactory("sNFT");
			sNFT = await SNFT.deploy();
		});
		it(`Should Alice Mint ${mint_amount_alice} sNFT`, async () => {
			price = Number(ethers.utils.formatEther(await sNFT.actualPrice()));
			await sNFT.connect(alice).mint( mint_amount_alice, { value: ethers.utils.parseEther(`${mint_amount_alice * price}`) } );
			expect(await sNFT.activeAmount()).to.equal(mint_amount_alice);
		});
		it(`Should BOB Mint ${mint_amount_bob} sNFT`, async () => {
			price = Number(ethers.utils.formatEther(await sNFT.actualPrice()));
			await sNFT.connect(alice).mint( mint_amount_bob, { value: ethers.utils.parseEther(`${mint_amount_bob * price}`) } );
			expect(await sNFT.activeAmount()).to.equal(mint_amount_alice+mint_amount_bob);
		});
	});
});