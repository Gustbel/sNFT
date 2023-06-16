const { expect } = require('chai');
import { ethers } from 'hardhat';
import { Contract, utils  } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const snft_initial_price = 50;	// In ETH
const factor = 70;

const mint_amount_alice = 4;
const mint_amount_bob = 70;
const mint_amount_carol = 1;

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
			sNFT = await SNFT.deploy(ethers.utils.parseEther(snft_initial_price.toString()), factor);
		});
		it(`Should Alice Mint ${mint_amount_alice} sNFT`, async () => {
			price = Number(ethers.utils.formatEther(await sNFT.actualPrice()));
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			console.log(`Balance of user: ${ethers.utils.formatEther(await alice.getBalance())}`)
			await sNFT.connect(alice).mint( mint_amount_alice, { value: ethers.utils.parseEther(`${mint_amount_alice * price}`) } );
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			console.log(`Balance of user: ${ethers.utils.formatEther(await alice.getBalance())}`)
			expect(await sNFT.totalActive()).to.equal(mint_amount_alice);
			expect(price).to.equal(Number(ethers.utils.formatEther(await sNFT.actualPrice())));
		});
		it(`Should BOB Mint ${mint_amount_bob} sNFT`, async () => {
			price = Number(ethers.utils.formatEther(await sNFT.actualPrice()));
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			console.log(`Balance of user: ${ethers.utils.formatEther(await bob.getBalance())}`)
			await sNFT.connect(bob).mint( mint_amount_bob, { value: ethers.utils.parseEther(`${mint_amount_bob * price}`) } );
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			console.log(`Balance of user: ${ethers.utils.formatEther(await bob.getBalance())}`)
			expect(await sNFT.totalActive()).to.equal(mint_amount_alice+mint_amount_bob);
			expect(price).to.equal(Number(ethers.utils.formatEther(await sNFT.actualPrice())));
		});
		it(`Should Bob Redeem all its sNFT`, async () => {
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			console.log(`Balance of user: ${ethers.utils.formatEther(await bob.getBalance())}`)
			const bobBalance = await sNFT.balanceOf(bob.address)
			console.log(bobBalance)
			for (let i = 0; i < bobBalance; i++) {
				const index = await sNFT.tokenOfOwnerByIndex(bob.address, i)
				console.log(`i: ${i} : index: ${index}`)
				await sNFT.connect(bob).redeem(index);
			}
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			console.log(`Balance of user: ${ethers.utils.formatEther(await bob.getBalance())}`)
		});
		it(`Should Alice Redeem 1 of its sNFT`, async () => {
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			console.log(`Balance of user: ${ethers.utils.formatEther(await alice.getBalance())}`)
			await sNFT.connect(alice).redeem(0);
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			console.log(`Balance of user: ${ethers.utils.formatEther(await alice.getBalance())}`)
		});
		it(`Should Carol Mint ${mint_amount_carol} sNFT`, async () => {
			console.log(`TOTAL SUPPLY: ${await sNFT.totalSupply()}`)
			price = Number(ethers.utils.formatEther(await sNFT.actualPrice()));
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			await sNFT.connect(carol).mint( mint_amount_carol, { value: ethers.utils.parseEther(`${mint_amount_carol * price}`) } );
			console.log(`Price: ${Number(ethers.utils.formatEther(await sNFT.actualPrice()))}`)
			expect(price).to.equal(Number(ethers.utils.formatEther(await sNFT.actualPrice())));
		});

		it(`Should Not Allow Alice Redeem 1 sNFT of Carol`, async () => {
			const index = await sNFT.tokenOfOwnerByIndex(carol.address, 0)
			await expect(sNFT.connect(alice).redeem(index)).to.be.revertedWith('Not approved to redeem');
		});

		it(`Should Allow Alice Redeem 1 sNFT of Carol (after approve)`, async () => {
			const index = await sNFT.tokenOfOwnerByIndex(carol.address, 0)
			await sNFT.connect(carol).approve(alice.address, index);
			await sNFT.connect(alice).redeem(index);
		});
	});
});