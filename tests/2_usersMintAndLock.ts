const { expect } = require('chai');
import { ethers } from 'hardhat';
import { BigNumber, Contract, utils  } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const MAX_UINT256 = BigInt(2 ** 256) - BigInt(1);

const snft_initial_price = 0.05;	// In ETH
const factor = 50;

const mint_amount_alice = 1;
const mint_amount_bob = 20;
const mint_amount_carol = 5;

describe(`2) Deploy sNFT contract and make simple interactions -- Mint - Lock - Approve`, () => {
	let owner: SignerWithAddress;
	let alice: SignerWithAddress, bob: SignerWithAddress, carol: SignerWithAddress;

	let sNFT: Contract;

	let price_bn: BigNumber;

	describe(`General`, () => {
		it(`Should init Signers`, async () => {
			[owner, alice, bob, carol] = await ethers.getSigners();
		});
		it(`Should deploy the SNFT contract`, async () => {
			let SNFT = await ethers.getContractFactory("sNFT");
			sNFT = await SNFT.deploy(
				ethers.utils.parseEther(snft_initial_price.toString()), 
				factor,
				MAX_UINT256 
			);		
		});
		it(`Should Alice Mint ${mint_amount_alice} sNFT`, async () => {
			price_bn = await sNFT.actualPrice();
			await sNFT.connect(alice).mint( mint_amount_alice, { value: price_bn.mul(mint_amount_alice) } );
			expect(await sNFT.totalUnlocked()).to.equal(mint_amount_alice);
		});
		it(`Should BOB Mint ${mint_amount_bob} sNFT`, async () => {
			price_bn = await sNFT.actualPrice();
			await sNFT.connect(bob).mint( mint_amount_bob, { value: price_bn.mul(mint_amount_bob) } );
			expect(await sNFT.totalUnlocked()).to.equal(mint_amount_alice+mint_amount_bob);
		});
		it(`Should Bob Lock 1 of its sNFT`, async () => {
			await sNFT.connect(bob).lock(3);
		});
		it(`Should Bob cannot Lock the same sNFT that was previously locked`, async () => {
			await expect(sNFT.connect(bob).lock(3)).to.be.revertedWith('This Asset is already locked');
		});
		it(`Should Carol Mint ${mint_amount_carol} sNFT`, async () => {
			price_bn = await sNFT.actualPrice();
			await sNFT.connect(carol).mint( mint_amount_carol, { value: price_bn.mul(mint_amount_carol) } );
		});

		it(`Should Not Allow Alice Lock 1 sNFT of Carol`, async () => {
			await expect(sNFT.connect(alice).lock(24)).to.be.revertedWith('Not approved to lock');
		});

		it(`Should Allow Alice Lock 1 sNFT of Carol (after approve)`, async () => {
			await sNFT.connect(carol).approve(alice.address, 24);
			await sNFT.connect(alice).lock(24);
		});
	});

	async function showInfo()
	{
		const price = Number(ethers.utils.formatEther(await sNFT.actualPrice()));
		console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
		console.log(`Balance of users:\n` +
					`\t Alice: ${ethers.utils.formatEther(await alice.getBalance())}` +
					`\t Bob: ${ethers.utils.formatEther(await bob.getBalance())}` +
					`\t Carol: ${ethers.utils.formatEther(await carol.getBalance())}`
				)
		console.log(`\t Balance of contract: ${ethers.utils.formatEther(await ethers.provider.getBalance(sNFT.address))}`)
	}
});