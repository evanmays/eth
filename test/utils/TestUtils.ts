import { BigNumberish, BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { DarkForestCore, DarkForestGetters } from '@darkforest_eth/contracts/typechain';
import { World } from './TestWorld';
import { LARGE_INTERVAL, planetWithArtifact1, initializers, TestLocation } from './WorldConstants';

const { BigNumber: BN, constants } = ethers;

const {
  PLANETHASH_KEY,
  SPACETYPE_KEY,
  BIOMEBASE_KEY,
  PERLIN_LENGTH_SCALE,
  PERLIN_MIRROR_X,
  PERLIN_MIRROR_Y,
} = initializers;

export const ZERO_ADDRESS = constants.AddressZero;
export const BN_ZERO = constants.Zero;

export function hexToBigNumber(hex: string): BigNumber {
  return BN.from(`0x${hex}`);
}

export function makeRevealArgs(
  planetLoc: TestLocation,
  x: number,
  y: number
): [
  [BigNumberish, BigNumberish],
  [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
  [BigNumberish, BigNumberish],
  [
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish
  ]
] {
  return [
    [BN_ZERO, BN_ZERO],
    [
      [BN_ZERO, BN_ZERO],
      [BN_ZERO, BN_ZERO],
    ],
    [BN_ZERO, BN_ZERO],
    [
      hexToBigNumber(planetLoc.hex),
      planetLoc.perlin,
      x,
      y,
      PLANETHASH_KEY,
      SPACETYPE_KEY,
      PERLIN_LENGTH_SCALE,
      PERLIN_MIRROR_X ? '1' : '0',
      PERLIN_MIRROR_Y ? '1' : '0',
    ],
  ];
}

export function makeInitArgs(
  planetLoc: TestLocation
): [
  [BigNumberish, BigNumberish],
  [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
  [BigNumberish, BigNumberish],
  [
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish
  ]
] {
  return [
    [BN_ZERO, BN_ZERO],
    [
      [BN_ZERO, BN_ZERO],
      [BN_ZERO, BN_ZERO],
    ],
    [BN_ZERO, BN_ZERO],
    [
      hexToBigNumber(planetLoc.hex),
      planetLoc.perlin,
      planetLoc.distFromOrigin + 1,
      PLANETHASH_KEY,
      SPACETYPE_KEY,
      PERLIN_LENGTH_SCALE,
      PERLIN_MIRROR_X ? '1' : '0',
      PERLIN_MIRROR_Y ? '1' : '0',
    ],
  ];
}

export function makeMoveArgs(
  oldLoc: TestLocation,
  newLoc: TestLocation,
  maxDist: BigNumberish,
  popMoved: BigNumberish,
  silverMoved: BigNumberish,
  movedArtifactId: BigNumberish = 0
): [
  [BigNumberish, BigNumberish],
  [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
  [BigNumberish, BigNumberish],
  [
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish
  ]
] {
  return [
    [0, 0],
    [
      [0, 0],
      [0, 0],
    ],
    [0, 0],
    [
      hexToBigNumber(oldLoc.hex),
      hexToBigNumber(newLoc.hex),
      newLoc.perlin,
      newLoc.distFromOrigin + 1,
      maxDist,
      PLANETHASH_KEY,
      SPACETYPE_KEY,
      PERLIN_LENGTH_SCALE,
      PERLIN_MIRROR_X ? '1' : '0',
      PERLIN_MIRROR_Y ? '1' : '0',
      popMoved,
      silverMoved,
      movedArtifactId,
    ],
  ];
}

export function makeFindArtifactArgs(
  location: TestLocation
): [
  [BigNumberish, BigNumberish],
  [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
  [BigNumberish, BigNumberish],
  [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish]
] {
  return [
    [1, 2],
    [
      [1, 2],
      [3, 4],
    ],
    [5, 6],
    [
      hexToBigNumber(location.hex),
      1,
      PLANETHASH_KEY,
      BIOMEBASE_KEY,
      PERLIN_LENGTH_SCALE,
      PERLIN_MIRROR_X ? '1' : '0',
      PERLIN_MIRROR_Y ? '1' : '0',
    ],
  ];
}

export async function increaseBlockchainTime(interval = LARGE_INTERVAL) {
  await ethers.provider.send('evm_increaseTime', [interval]);
  await ethers.provider.send('evm_mine', []);
}

export async function getCurrentTime() {
  return (await ethers.provider.getBlock('latest')).timestamp;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function getStatSum(planet: any) {
  let statSum = 0;
  for (const stat of ['speed', 'range', 'defense', 'populationCap', 'populationGrowth']) {
    statSum += planet[stat].toNumber();
  }
  return statSum;
}

// conquers an untouched planet `to` by repeatedly sending attacks from `from`
// assumes that `to` is owned by `signer` and that `from` is an unowned planet
// throws if `from` is owned
export async function conquerUnownedPlanet(
  world: World,
  signer: DarkForestCore,
  from: TestLocation,
  to: TestLocation
) {
  const fromId = hexToBigNumber(from.hex);
  const toId = hexToBigNumber(to.hex);
  const fromData = await world.contracts.core.planets(fromId);
  let toData = await world.contracts.core.planets(toId);
  if (toData.owner !== ZERO_ADDRESS) {
    throw new Error('called conquerUnownedPlanet to conquer owned planet');
  }
  const attackEnergyCost = fromData.populationCap.toNumber() * 0.9;
  await increaseBlockchainTime();
  await (await signer.move(...makeMoveArgs(from, to, 0, attackEnergyCost, 0))).wait(); // creates planet in contract
  toData = await world.contracts.core.planets(toId);
  const toPlanetStartingPop = toData.population.toNumber(); // move hasn't yet been applied

  await (await signer.refreshPlanet(toId)).wait(); // applies move, since 0 moveDist
  toData = await world.contracts.core.planets(toId);

  if (toData.owner === ZERO_ADDRESS) {
    // send additional attacks if not yet conquered
    const attackDamage = toPlanetStartingPop - toData.population.toNumber();
    const attacksNeeded = Math.floor(toData.population.toNumber() / attackDamage) + 1;
    for (let i = 0; i < attacksNeeded; i++) {
      await increaseBlockchainTime();
      await signer.move(...makeMoveArgs(from, to, 0, attackEnergyCost, 0));
    }
  }
}

// shuttles silver from `silverProducer` to `to` until `to` is maxed on silver
export async function feedSilverToCap(
  world: World,
  signer: DarkForestCore,
  silverMine: TestLocation,
  to: TestLocation
) {
  const silverMineId = hexToBigNumber(silverMine.hex);
  const toId = hexToBigNumber(to.hex);

  const silverMineData = await world.contracts.core.planets(silverMineId);
  const toData = await world.contracts.core.planets(toId);
  const attackEnergyCost = silverMineData.populationCap.toNumber() * 0.1;
  const silverMineSilverCap = silverMineData.silverCap.toNumber();
  const toSilverCap = toData.silverCap.toNumber();

  for (let i = 0; i < Math.ceil(toSilverCap / silverMineSilverCap); i++) {
    await increaseBlockchainTime();
    await signer.move(...makeMoveArgs(silverMine, to, 0, attackEnergyCost, silverMineSilverCap));
  }
}

// returns the ID of the artifact minted
export async function user1MintArtifactPlanet(user1Core: DarkForestCore) {
  const planetWithArtifact1Id = hexToBigNumber(planetWithArtifact1.hex);
  await user1Core.prospectPlanet(planetWithArtifact1Id);
  await increaseBlockchainTime();
  const findArtifactTx = await user1Core.findArtifact(...makeFindArtifactArgs(planetWithArtifact1));
  const findArtifactReceipt = await findArtifactTx.wait();
  // 0th event is erc721 transfer (i think); 1st event is UpdateArtifact, 2nd argument of this event is artifactId
  const artifactId = findArtifactReceipt.events?.[1].args?.[1];
  return artifactId;
}

export async function getArtifactsOwnedBy(getters: DarkForestGetters, addr: string) {
  const artifactsIds = await getters.getPlayerArtifactIds(addr);
  return (await getters.bulkGetArtifactsByIds(artifactsIds)).map(
    (artifactWithMetadata) => artifactWithMetadata[0]
  );
}
