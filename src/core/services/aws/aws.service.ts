/* eslint-disable @typescript-eslint/no-unused-vars */
import { AwsDTO } from '@environments/dto/aws.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AWSError, Credentials, S3 } from 'aws-sdk';
import { S3_CONTENT_TYPE } from './constants/aws.constants';
import { SignedUrlDTO } from './dto/signed-url.file.dto';

@Injectable()
export class AwsService {
  private awsConfig: AwsDTO;
  private s3: S3;

  constructor(private readonly configService: ConfigService) {
    this.awsConfig = this.configService.get<AwsDTO>('aws');

    const credentials = new Credentials({
      accessKeyId: this.awsConfig.accessKeyId,
      secretAccessKey: this.awsConfig.secretAccessKey,
    });

    this.s3 = new S3({
      region: this.awsConfig.region,
      credentials,
    });
  }

  uploadFile(path: string, buffer: Buffer, ContentType?: string) {
    return this.s3.putObject(
      {
        Key: path,
        Bucket: this.awsConfig.bucket,
        Body: buffer,
        ContentType,
      },
      (error: AWSError) => this.handleAWSError(error),
    );
  }

  deleteFile(path: string) {
    return this.s3.deleteObject(
      {
        Key: path,
        Bucket: this.awsConfig.bucket,
      },
      (error: AWSError) => this.handleAWSError(error),
    );
  }

  deleteFolder(folderPath: string, contentType?: S3_CONTENT_TYPE): void {
    const s3Params = {
      Bucket: this.awsConfig.bucket,
      Prefix: folderPath,
      ResponseContentType: contentType,
    };
    this.s3.listObjectsV2(s3Params, (error: AWSError, url: any) => {
      if (error) this.handleAWSError(error);
      else {
        const deleteObjectsParams = {
          Bucket: s3Params.Bucket,
          Delete: {
            Objects: url.Contents?.map((object) => ({ Key: object.Key })),
          },
        };
        this.s3.deleteObjects(
          deleteObjectsParams,
          (error: AWSError, data: S3.DeleteObjectsOutput) => {
            this.handleAWSError(error);
          },
        );
      }
    });
  }

  handleAWSError(awsError: AWSError) {
    if (awsError)
      throw new HttpException(awsError.message, HttpStatus.BAD_REQUEST);
  }

  getStaticUrl(path: string, name?: string) {
    // const filePath = `https://barberias.s3.amazonaws.com/${path}`;
    // const signedUrlDTO: SignedUrlDTO = { url: filePath, key: name };
    // return signedUrlDTO;
  }

  getUrl(path: string, contentType?: S3_CONTENT_TYPE) {
    const s3Params = {
      Bucket: this.awsConfig.bucket,
      Key: path,
      ResponseContentType: contentType,
    };
    this.s3.getSignedUrl(
      'getObject',
      s3Params,
      (error: AWSError, url: string) => {
        if (error) this.handleAWSError(error);
        else {
          const signedUrlDTO: SignedUrlDTO = { url };
          return signedUrlDTO;
        }
      },
    );
  }

  listUrl(path: string, contentType?: S3_CONTENT_TYPE) {
    const s3Params = {
      Bucket: this.awsConfig.bucket,
      Prefix: path,
      ResponseContentType: contentType,
    };

    this.s3.listObjectsV2(s3Params, (error: AWSError, url: any) => {
      if (error) this.handleAWSError(error);
      else {
        const signedUrls: SignedUrlDTO[] = [];
        const staticPath = `https://barberias.s3.amazonaws.com/${path}`;
        for (const obj of url.Contents) {
          // const url = this.s3.getSignedUrl('getObject', {
          //   Bucket: this.awsConfig.bucket,
          //   Key: obj.Key,
          //   ResponseContentType: contentType,
          // });
          const fileName = obj.Key.split('/')[obj.Key.split('/').length - 1];

          signedUrls.push({ url: `${staticPath}${fileName}`, key: obj.Key });
        }

        return signedUrls;
      }
    });
  }
}
