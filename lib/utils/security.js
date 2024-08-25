import { JSEncrypt } from 'jsencrypt';
import { enc, mode as encMode, AES, pad } from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

export const encryptServiceData = (payload, publicKey) => {
  const encryptor = new JSEncrypt();

  encryptor.setPublicKey(publicKey);

  const uuid = uuidv4().replace(/-/g, '');
  const encryptedKey = encryptor.encrypt(uuid);
  const key = enc.Base64.parse(uuid);

  const encryptedData =
    AES.encrypt(JSON.stringify(payload), key, {
      mode: encMode.ECB,
      padding: pad.Pkcs7,
    })?.toString() || '';

  const formData = new URLSearchParams();
  formData.append('key', encryptedKey);
  formData.append('data', encryptedData);

  return formData;
};
