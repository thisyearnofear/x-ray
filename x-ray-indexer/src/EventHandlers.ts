/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  MedicalAchievementNFT,
  MedicalAchievementNFT_CertificateMinted,
} from "generated";

MedicalAchievementNFT.CertificateMinted.handler(async ({ event, context }) => {
  const entity: MedicalAchievementNFT_CertificateMinted = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tokenId: event.params.tokenId,
    recipient: event.params.recipient,
    diagnosis: event.params.diagnosis,
    accuracy: event.params.accuracy,
  };

  context.MedicalAchievementNFT_CertificateMinted.set(entity);
});
