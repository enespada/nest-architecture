import { RedsysDTO } from '@environments/dto/redsys.dto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Redsys } from 'node-redsys-api';
import {
  MerchantParams,
  RedsysPaymentResponse,
  RedsysRequestParams,
  ResponsePaymentInterface,
} from './dto/redsys.dto';
import { CreatePaymentRedsysDto } from './dto/create-payment-redsys.dto';

@Injectable()
export class RedsysService {
  private redsys;
  private config: RedsysDTO;

  constructor(private readonly configService: ConfigService) {
    this.redsys = new Redsys();
    this.config = this.configService.get<RedsysDTO>('redsys');
  }

  /**
   * Generates random order reference with 10 digits
   * @returns {string} The order reference
   */
  private newOrderReference(): string {
    return Math.floor(Math.random() * 10000000000).toString();
  }

  /**
   * Creates object with Redsys merchant params
   * @param {number} amount
   * @param {string} dsMerchantOrder
   * @returns {MerchantParams} Redsys merchant object
   */
  private getMerchantParamsObject(
    dto: CreatePaymentRedsysDto,
    dsMerchantOrder: string,
  ): MerchantParams {
    return {
      DS_MERCHANT_AMOUNT: dto.amount,
      DS_MERCHANT_ORDER: dsMerchantOrder,
      DS_MERCHANT_MERCHANTCODE: this.config.DS_MERCHANT_MERCHANTCODE,
      DS_MERCHANT_CURRENCY: this.config.DS_MERCHANT_CURRENCY,
      DS_MERCHANT_MERCHANTDATA: Buffer.from(JSON.stringify(dto.data)).toString(
        'base64',
      ),
      DS_MERCHANT_TRANSACTIONTYPE: this.config.DS_MERCHANT_TRANSACTIONTYPE,
      DS_MERCHANT_TERMINAL: this.config.DS_MERCHANT_TERMINAL,
      DS_MERCHANT_MERCHANTURL: this.config.DS_MERCHANT_MERCHANTURL,
      DS_MERCHANT_URLOK: dto.urlOk ?? this.config.DS_MERCHANT_URLOK,
      DS_MERCHANT_URLKO: dto.urlKo ?? this.config.DS_MERCHANT_URLKO,
    };
  }

  getRequestParams(dto: CreatePaymentRedsysDto): RedsysRequestParams {
    const dsMerchantOrder = this.newOrderReference();
    const mParams: MerchantParams = this.getMerchantParamsObject(
      dto,
      dsMerchantOrder,
    );

    const response: RedsysRequestParams = {
      redsysUrl: this.config.redsysUrl,
      Ds_SignatureVersion: this.config.DS_SIGNATURE_VERSION,
      Ds_MerchantParameters: this.redsys.createMerchantParameters(mParams),
      Ds_Signature: this.redsys.createMerchantSignature(
        this.config.MERCHANT_KEY,
        mParams,
      ),
    };

    return response;
  }

  getResponse(
    merchantParams: string,
    signature: string,
  ): RedsysPaymentResponse {
    const merchantParamsDecoded: ResponsePaymentInterface =
      this.redsys.decodeMerchantParameters(merchantParams);

    const merchantSignatureNotif = this.redsys.createMerchantSignatureNotif(
      this.config.MERCHANT_KEY,
      merchantParams,
    );
    const dsResponse = parseInt(merchantParamsDecoded.Ds_Response);

    const valid =
      this.redsys.merchantSignatureIsValid(signature, merchantSignatureNotif) &&
      dsResponse > -1 &&
      dsResponse < 100;

    return { valid, data: merchantParamsDecoded } as RedsysPaymentResponse;
  }
}
