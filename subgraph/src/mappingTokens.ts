import { Address } from '@graphprotocol/graph-ts';

import { DarkForestGetters } from '../generated/DarkForestCore/DarkForestGetters';
import { Transfer } from '../generated/DarkForestTokens/DarkForestTokens';
import { refreshArtifactFromContractData } from './helpers/decoders';
import { GETTERS_CONTRACT_ADDRESS } from '@darkforest_eth/contracts';
import { Artifact } from '../generated/schema';

export function handleTransfer(event: Transfer): void {
  let artifact = Artifact.load(event.params.tokenId.toHexString());
  if (artifact !== null) {
    artifact.owner = event.params.to.toHexString();
    artifact.save();
  } else {
    // artifact was just minted, so it's not in store yet
    // note that a _mint does emit a Transfer ERC721 event
    let getters = DarkForestGetters.bind(Address.fromString(GETTERS_CONTRACT_ADDRESS));
    let rawArtifact = getters.bulkGetArtifactsByIds([event.params.tokenId]);

    artifact = refreshArtifactFromContractData(event.params.tokenId, rawArtifact[0]);
    artifact.save();
  }
}
