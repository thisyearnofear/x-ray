import assert from "assert";
import { 
  TestHelpers,
  MedicalAchievementNFT_CertificateMinted
} from "generated";
const { MockDb, MedicalAchievementNFT } = TestHelpers;

describe("MedicalAchievementNFT contract CertificateMinted event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for MedicalAchievementNFT contract CertificateMinted event
  const event = MedicalAchievementNFT.CertificateMinted.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("MedicalAchievementNFT_CertificateMinted is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await MedicalAchievementNFT.CertificateMinted.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualMedicalAchievementNFTCertificateMinted = mockDbUpdated.entities.MedicalAchievementNFT_CertificateMinted.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedMedicalAchievementNFTCertificateMinted: MedicalAchievementNFT_CertificateMinted = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      tokenId: event.params.tokenId,
      recipient: event.params.recipient,
      diagnosis: event.params.diagnosis,
      accuracy: event.params.accuracy,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualMedicalAchievementNFTCertificateMinted, expectedMedicalAchievementNFTCertificateMinted, "Actual MedicalAchievementNFTCertificateMinted should be the same as the expectedMedicalAchievementNFTCertificateMinted");
  });
});
