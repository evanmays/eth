import { BigInt } from '@graphprotocol/graph-ts';

// byte 9: energy cap bonus if byte is < 16
export function isEnergyCapBoosted(locationId: string): boolean {
  return locationId.charAt(18) === '0';
}

// byte 10: energy grow bonus if byte is < 16
export function isEnergyGrowthBoosted(locationId: string): boolean {
  return locationId.charAt(20) === '0';
}

// byte 11: range bonus if byte is < 16
export function isRangeBoosted(locationId: string): boolean {
  return locationId.charAt(22) === '0';
}

// byte 12: speed bonus if byte is < 16
export function isSpeedBoosted(locationId: string): boolean {
  return locationId.charAt(24) === '0';
}

// byte 13: defense bonus if byte is < 16
export function isDefenseBoosted(locationId: string): boolean {
  return locationId.charAt(26) === '0';
}

// BigInt does not get 0 padded by toHexString plus gets a 0x prefix...
export function hexStringToPaddedUnprefixed(prefixed: string): string {
  // strip 0x
  let stripped = prefixed.substring(2, prefixed.length);
  // pad to 64
  let padded = stripped.padStart(64, '0');
  return padded;
}

export function toSpaceType(spaceType: i32): string {
  if (spaceType === 0) {
    return 'NEBULA';
  } else if (spaceType === 1) {
    return 'SPACE';
  } else if (spaceType === 2) {
    return 'DEEP_SPACE';
  } else {
    return 'DEAD_SPACE';
  }
}

export function toPlanetType(planetType: i32): string {
  if (planetType === 1) {
    return 'SILVER_MINE';
  } else if (planetType === 2) {
    return 'RUINS';
  } else if (planetType === 3) {
    return 'TRADING_POST';
  } else if (planetType === 4) {
    return 'SILVER_BANK';
  }
  return 'PLANET';
}

export function toArrivalType(arrivalType: i32): string {
  if (arrivalType === 1) {
    return 'NORMAL';
  } else if (arrivalType === 2) {
    return 'PHOTOID';
  } else if (arrivalType === 3) {
    return 'WORMHOLE';
  }
  return 'UNKNOWN';
}

export function toArtifactType(artifactType: i32): string {
  if (artifactType === 1) {
    return 'MONOLITH';
  } else if (artifactType === 2) {
    return 'COLOSSUS';
  } else if (artifactType === 3) {
    return 'SPACESHIP';
  } else if (artifactType === 4) {
    return 'PYRAMID';
  } else if (artifactType === 5) {
    return 'WORMHOLE';
  } else if (artifactType === 6) {
    return 'PLANETARYSHIELD';
  } else if (artifactType === 7) {
    return 'PHOTOIDCANNON';
  } else if (artifactType === 8) {
    return 'BLOOMFILTER';
  } else if (artifactType === 9) {
    return 'BLACKDOMAIN';
  } else {
    return 'UNKNOWN';
  }
}

export function toArtifactRarity(rarity: i32): string {
  if (rarity === 1) {
    return 'COMMON';
  } else if (rarity === 2) {
    return 'RARE';
  } else if (rarity === 3) {
    return 'EPIC';
  } else if (rarity === 4) {
    return 'LEGENDARY';
  } else if (rarity === 5) {
    return 'MYTHIC';
  } else {
    return 'UNKNOWN';
  }
}

export function toBiome(biome: i32): string {
  if (biome === 1) {
    return 'OCEAN';
  } else if (biome === 2) {
    return 'FOREST';
  } else if (biome === 3) {
    return 'GRASSLAND';
  } else if (biome === 4) {
    return 'TUNDRA';
  } else if (biome === 5) {
    return 'SWAMP';
  } else if (biome === 6) {
    return 'DESERT';
  } else if (biome === 7) {
    return 'ICE';
  } else if (biome === 8) {
    return 'WASTELAND';
  } else if (biome === 9) {
    return 'LAVA';
  } else if (biome === 10) {
    return 'CORRUPTED';
  } else {
    return 'UNKNOWN';
  }
}

export function bjjFieldElementToSignedInt(n: BigInt): i32 {
  let p = BigInt.fromString(
    '21888242871839275222246405745257275088548364400416034343698204186575808495617'
  );
  // check if n > 2^31
  if (n.gt(BigInt.fromString('2147483648'))) {
    return n.minus(p).toI32();
  }
  return n.toI32();
}

export function toLowercase(str: string): string {
  let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ret = '';
  for (let i = 0; i < str.length; i++) {
    if (uppercase.includes(str.charAt(i))) {
      ret += String.fromCharCode(str.charCodeAt(i) + 32);
    } else {
      ret += str.charAt(i);
    }
  }
  return ret;
}
