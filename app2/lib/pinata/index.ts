const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload JSON metadata to Pinata IPFS
 */
export async function uploadMetadata(metadata: object): Promise<string> {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `time-capsule-metadata-${Date.now()}`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload metadata: ${error}`);
  }

  const data: PinataUploadResponse = await response.json();
  return `${PINATA_GATEWAY}/${data.IpfsHash}`;
}

/**
 * Upload an image file to Pinata IPFS
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: `time-capsule-image-${Date.now()}`,
    })
  );
  formData.append(
    "pinataOptions",
    JSON.stringify({
      cidVersion: 1,
    })
  );

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload image: ${error}`);
  }

  const data: PinataUploadResponse = await response.json();
  return `${PINATA_GATEWAY}/${data.IpfsHash}`;
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchMetadata<T>(uri: string): Promise<T | null> {
  try {
    // Handle different URI formats
    let url = uri;
    if (uri.startsWith("ipfs://")) {
      url = `${PINATA_GATEWAY}/${uri.replace("ipfs://", "")}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch metadata from ${url}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
}

