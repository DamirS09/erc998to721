const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("ERC998TopDownComposableEnumerable", function () {
  let owner;
  let addr1;
  let addr2;
  let addresses;
  let erc998;
  let erc721;
  const testUri =
    "https://ipfs.io/ipfs/QmWCt8Jrrqs79VGSpCcSorv497hScu6QkBkxdMyJ2mS9KM?filename=cat.jpeg";
  let tokenCounter = 0;
  let tokensById = [];
  before(async () => {
    const ERC998TopDownComposableEnumerable = await ethers.getContractFactory(
      "ERC998TopDownComposableEnumerable"
    );
    [owner, addr1, addr2, ...addresses] = await ethers.getSigners();
    erc998 = await ERC998TopDownComposableEnumerable.deploy();
    await erc998.deployed();


    const CustomERC721 = await ethers.getContractFactory("CustomERC721");
    [owner, addr1, addr2, ...addresses] = await ethers.getSigners();
    erc721 = await CustomERC721.deploy();
    await erc721.deployed();

  });

  it("should mint a parentNFT and a childNFT to the owner address", async function () {
    //mint parent
    const txp = await erc998
      .mintParent(owner.address, testUri)
      .catch((err) => console.log("PARENT MINT ERROR", err));

    //mint child
    const txc = await erc998
      .mintChild(tokenCounter, testUri)
      .catch((err) => console.log("CHILD MINT ERROR", err));
    const parentId = tokenCounter;
    tokensById.push({ parent0: parentId });
    const promiseP = await txp.wait().then((res) => tokenCounter++);
    const childId = tokenCounter;
    tokensById.push({ child0: childId });
    const promiseC = await txc.wait().then((res) => tokenCounter++);

    const parentOwner = await erc998.ownerOf(parentId);
    const childOwner = await erc998.ownerOf(childId);
    console.log(
      "PARENT OWNER",
      parentOwner,
      "CHILD OWNER",
      childOwner,
      parentId,
      childId
    );
    //promiseP.events[0].args.to;
    assert((parentOwner && childOwner) === owner.address);
  });

  it("should mint a child and parent nft to addr1", async function () {
    //store parentCounter
    const parentId = tokenCounter;
    tokensById.push({ parent1: parentId });
    //mint parent
    const txp = await erc998
      .mintParent(addr1.address, testUri)
      .catch((err) => console.log("PARENT MINT ERROR", err));

    //mint child
    const txc = await erc998
      .mintChild(parentId, testUri)
      .catch((err) => console.log("CHILD MINT ERROR", err));

    const promiseP = await txp.wait().then((res) => tokenCounter++);
    const childId = tokenCounter;
    tokensById.push({ child1: childId });
    const promiseC = await txc.wait().then((res) => tokenCounter++);

    const parentOwner = await erc998.ownerOf(parentId);
    const childOwner = await erc998.ownerOf(childId);
    console.log(
      "PARENT OWNER",
      parentOwner,
      "CHILD OWNER",
      childOwner,
      parentId,
      childId
    );
    //promiseP.events[0].args.to;
    assert((parentOwner && childOwner) === addr1.address);
  });

  it("should return the number nft's owned by an address(owner)", async function () {
    const tx = await erc998.balanceOf(owner.address);

    assert(tx.toNumber() === 2, "address holds incorrect number of tokens");
  });

  it("should return the root owner of owner of child0 (owner account)", async function () {
    const ownerOfParent = await erc998.addressOfRootOwner(erc998.address, 1);
    assert(ownerOfParent === owner.address);
  });

  it("should return the number nft's owned by an address(addr1)", async function () {
    const tx = await erc998.balanceOf(addr1.address);

    assert(tx.toNumber() === 2, "address holds incorrect number of tokens");
  });

});
