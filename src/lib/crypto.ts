import { env } from '~/env'

const encryptData = async (plainData: string, encryptionKey: string) => {
  // Generate a random 96-bit initialization vector (IV)
  const initVector = crypto.getRandomValues(new Uint8Array(12))

  // Encode the data to be encrypted
  const encodedData = new TextEncoder().encode(plainData)

  // Prepare the encryption key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(encryptionKey, 'base64'),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  )

  // Encrypt the encoded data with the key
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: initVector,
    },
    cryptoKey,
    encodedData,
  )

  // Return the encrypted data and the IV, both in base64 format
  return {
    encryptedData: Buffer.from(encryptedData).toString('base64'),
    initVector: Buffer.from(initVector).toString('base64'),
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function handleEncryption<T = any>(data: T) {
  return await encryptData(JSON.stringify({ data }), env.APP_KEY)
}

const decryptData = async (
  encryptedData: string,
  initVector: string,
  encryptionKey: string,
) => {
  // Prepare the decryption key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(encryptionKey, 'base64'),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  )

  try {
    // Decrypt the encrypted data using the key and IV
    const decodedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: Buffer.from(initVector, 'base64'),
      },
      cryptoKey,
      Buffer.from(encryptedData, 'base64'),
    )

    // Decode and return the decrypted data
    return new TextDecoder().decode(decodedData)
  } catch (error) {
    return JSON.stringify({ payload: null })
  }
}

type DecryptionData = {
  encryptedData: string
  initVector: string
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function handleDecryption<T = any>({
  encryptedData,
  initVector,
}: DecryptionData) {
  const decryptedString = await decryptData(
    encryptedData,
    initVector,
    env.APP_KEY,
  )

  const responseData = JSON.parse(decryptedString)?.data

  return responseData as T
}
