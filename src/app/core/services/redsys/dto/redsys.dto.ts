import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export interface RedsysPaymentResponse {
  valid: boolean;
  data: ResponsePaymentInterface;
}

export interface ResponsePaymentInterface {
  Ds_Date: string;
  Ds_Hour: string;
  Ds_SecurePayment: string;
  Ds_Amount: string;
  Ds_Currency: string;
  Ds_Order: string;
  Ds_MerchantCode: string;
  Ds_Terminal: string;
  Ds_Response: string;
  Ds_TransactionType: string;
  Ds_MerchantData: string;
  Ds_AuthorisationCode: string;
  Ds_CustomerLanguage: string;
  Ds_Card_Brand: string;
}

export interface MerchantParams {
  DS_MERCHANT_AMOUNT: number;
  DS_MERCHANT_ORDER: string;
  DS_MERCHANT_MERCHANTCODE: string;
  DS_MERCHANT_CURRENCY: string;
  DS_MERCHANT_TRANSACTIONTYPE: string;
  DS_MERCHANT_TERMINAL: string;
  DS_MERCHANT_MERCHANTDATA: string;
  DS_MERCHANT_MERCHANTURL: string;
  DS_MERCHANT_URLOK: string;
  DS_MERCHANT_URLKO: string;
}

export class RedsysCreateRequestParams {
  @ApiProperty({ isArray: true, type: Number })
  @IsNotEmpty()
  students: Array<number>;

  @ApiProperty()
  @IsNotEmpty()
  manager: Partial<number>;
}

export class RedsysCreateRequestParamsDto {}

export class RedsysRequestParams {
  @ApiProperty()
  redsysUrl: string;

  @ApiProperty()
  Ds_SignatureVersion: string;

  @ApiProperty()
  Ds_MerchantParameters: string;

  @ApiProperty()
  Ds_Signature: string;
}
