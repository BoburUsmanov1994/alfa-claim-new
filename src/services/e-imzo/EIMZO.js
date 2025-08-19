import axios from "axios";
import { EIMZOClient as client } from "./e-imzo-client";
import { get } from "lodash";
import { request } from "../api";


const CAPIWS = window.CAPIWS;

export default class EIMZO {
    _loadedKey = null;
    get loadedKey() {
        return this._loadedKey;
    }
    set loadedKey(value) {
        this._loadedKey = value;
    }
    apiKeys = [
        'pr1.alfainvest.uz', '18CC7A97C675E14D9817CD4BDC9AA8A02DD53C241C49B8BEC53A705A8FED99FE826E7ED41D087D21B9B62E781CA46F4E30D85F71DEF3EDCBD48D1B430EC0AA8E',
    ];
    async checkVersion() {
        return new Promise((resolve, reject) => {
            client.checkVersion(
                function (major, minor) {
                    resolve({ major, minor });
                },
                function (error, message) {
                    reject(error, message);
                }
            );
        });
    }

    async installApiKeys() {
        return new Promise((resolve, reject) => {
            client.installApiKeys(resolve, reject);
        });
    }

    async listAllUserKeys() {
        return new Promise((resolve, reject) => {
            client.listAllUserKeys(
                function (cert, index) {
                    return "cert-" + cert.serialNumber + "-" + index;
                },
                function (index, cert) {
                    return cert;
                },
                function (items, firstId) {
                    resolve(items, firstId);
                },
                function (error, reason) {
                    reject(error, reason);
                }
            );
        });
    }

    async loadKey(cert) {
        return new Promise((resolve, reject) => {
            client.loadKey(
                cert,
                (id) => {
                    this._loadedKey = cert;
                    resolve({ cert, id });
                },
                reject
            );
        });
    }

    async getCertificateChain(loadKeyId) {
        return new Promise((resolve, reject) => {
            CAPIWS.callFunction(
                {
                    plugin: "x509",
                    name: "get_certificate_chain",
                    arguments: [loadKeyId],
                },
                (event, data) => {
                    if (data.success) {
                        resolve(data.certificates);
                    } else {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject("Failed");
                    }
                },
                reject
            );
        });
    }

    async getMainCertificate(loadKeyId) {
        const result = await this.getCertificateChain(loadKeyId);

        if (Array.isArray(result) && result.length > 0) {
            return result[0];
        }
        return null;
    }

    async getCertInfo(cert) {
        return new Promise((resolve, reject) => {
            CAPIWS.callFunction(
                { name: "get_certificate_info", arguments: [cert] },
                (event, data) => {
                    if (data.success) {
                        resolve(data.certificate_info);
                    } else {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject("Failed");
                    }
                },
                reject
            );
        });
    }

    async signPkcs7(cert, content) {
        const loadKeyResult = await this.loadKey(cert);
        return new Promise((resolve, reject) => {
            CAPIWS.callFunction(
                {
                    name: "create_pkcs7",
                    plugin: "pkcs7",
                    arguments: [window.Base64.encode(content), loadKeyResult.id, "no"],
                },
                (event, data) => {
                    if (data.success) {
                        resolve(data);
                    } else {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject("Failed");
                    }
                },
                reject
            );
        });
    }


    async createNewPkcs7(cert, content) {

        const challenge = await request.get("api/eimzo/challenge").then(res => res);

        const response = get(challenge,"data");

        let sessiosResultId = sessionStorage.getItem(cert.serialNumber)

        let storedTime = sessionStorage.getItem(`${cert.serialNumber}_time`);
        const now = new Date().getTime();

        if (sessiosResultId && storedTime) {
            const elapsedHours = (now - storedTime) / (1000 * 60 * 60);
            if (elapsedHours >= 6) {
                sessionStorage.removeItem(cert.serialNumber);
                sessionStorage.removeItem(`${cert.serialNumber}_time`);
                sessiosResultId = null;
            }
        }
        if(!sessiosResultId){
            const {id} = await this.loadKey(cert);
            sessiosResultId = id
            sessionStorage.setItem(cert.serialNumber,id)
            sessionStorage.setItem(`${cert.serialNumber}_time`, now.toString());
        }
        return new Promise((resolve, reject) => {
            console.log('ENCODED_JSON',window.Base64.encode(content))

            CAPIWS.callFunction(
                {
                    name: 'create_pkcs7',
                    plugin: 'pkcs7',
                    arguments: [window.Base64.encode(content), sessiosResultId, 'yes']
                },
                (event, data) => {
                    if (data.success) {
                        resolve(data)
                    } else {

                        reject('Failed')
                    }
                },
                reject
            );
        });
    }
    async createPkcs7(id, content, timestamper) {
        return new Promise((resolve, reject) => {
            client.createPkcs7(
                id,
                content,
                timestamper,
                (/* string */ pkcs7) => {
                    resolve(pkcs7);
                },
                reject
            );
        });
    }

    async getTimestampToken(signature) {
        return new Promise((resolve, reject) => {
            CAPIWS.callFunction(
                {
                    name: "get_timestamp_token_request_for_signature",
                    arguments: [signature],
                },
                function (event, data) {
                    if (data.success) {
                        resolve(data.timestamp_request_64);
                    } else {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject("Failed");
                    }
                },
                reject
            );
        });
    }

    addApiKey(domain, key) {
        if (!this.apiKeys.includes(domain)) {
            this.apiKeys.push(domain, key);
        }
    }

    async install() {
        await this.checkVersion();

        client.API_KEYS = this.apiKeys;

        await this.installApiKeys();
    }
}
