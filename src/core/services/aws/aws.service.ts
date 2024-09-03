/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AWSError, Credentials, S3 } from 'aws-sdk';
import { AwsDTO } from '@environments/dto/aws.dto';
import { S3_CONTENT_TYPE } from './constants/aws.constants';
import { SignedUrlDTO } from './dto/signed-url.file.dto';
import { GetObjectRequest, HeadObjectRequest } from 'aws-sdk/clients/s3';

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

  async uploadFile(
    path: string,
    buffer: Buffer,
    ContentType?: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.s3.putObject(
        {
          Key: path,
          Bucket: this.awsConfig.bucket,
          Body: buffer,
          ContentType,
        },
        (error: AWSError) => {
          if (error) {
            this.handleAWSError(error);
            reject(error);
          }
          resolve();
        },
      );
    });
  }

  async deleteFile(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {
          Key: path,
          Bucket: this.awsConfig.bucket,
        },
        (error: AWSError) => {
          if (error) {
            this.handleAWSError(error);
            reject(error);
          }
          resolve();
        },
      );
    });
  }

  async deleteFolder(
    folderPath: string,
    contentType?: S3_CONTENT_TYPE,
  ): Promise<void> {
    const s3Params = {
      Bucket: this.awsConfig.bucket,
      Prefix: folderPath,
      ResponseContentType: contentType,
    };
    return new Promise((resolve, reject) => {
      this.s3.listObjectsV2(
        s3Params,
        (error: AWSError, url: S3.ListObjectsV2Output) => {
          if (error) {
            this.handleAWSError(error);
            reject(error);
          } else {
            if (url.Contents.length === 0) {
              resolve();
              return;
            } else {
              const deleteObjectsParams = {
                Bucket: s3Params.Bucket,
                Delete: {
                  Objects: url.Contents?.map((object) => ({ Key: object.Key })),
                },
              };
              resolve(
                new Promise((resolve1, reject1) => {
                  this.s3.deleteObjects(
                    deleteObjectsParams,
                    (error: AWSError, data: S3.DeleteObjectsOutput) => {
                      if (error) {
                        this.handleAWSError(error);
                        reject1(error);
                      }
                      resolve1();
                    },
                  );
                }),
              );
            }
          }
        },
      );
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

  async getUrl(
    path: string,
    contentType?: S3_CONTENT_TYPE,
  ): Promise<SignedUrlDTO> {
    const s3Params: GetObjectRequest = {
      Bucket: this.awsConfig.bucket,
      Key: path,
      ResponseContentType: contentType,
    };

    // Verificar si el objeto existe
    const headParams: HeadObjectRequest = {
      Bucket: this.awsConfig.bucket,
      Key: path,
    };

    try {
      await this.s3.headObject(headParams).promise();
    } catch (error) {
      if (error.code === 'NotFound') {
        console.error('Object not found');
        return null;
      } else {
        console.error('Object not verified: ', error);
        throw error;
      }
    }
    return new Promise((resolve, reject) => {
      this.s3.getSignedUrl(
        'getObject',
        s3Params,
        (error: AWSError, data: string) => {
          if (error) {
            resolve(null);
            // reject(error);
          } else {
            const signedUrlDTO: SignedUrlDTO = { url: data, key: path };
            resolve(signedUrlDTO);
          }
        },
      );
    });
  }

  async listUrl(
    path: string,
    contentType?: S3_CONTENT_TYPE,
  ): Promise<SignedUrlDTO[]> {
    const s3Params = {
      Bucket: this.awsConfig.bucket,
      Prefix: path,
      ResponseContentType: contentType,
    };

    return new Promise((resolve, reject) => {
      this.s3.listObjectsV2(
        s3Params,
        (error: AWSError, url: S3.ListObjectsV2Output) => {
          if (error) {
            this.handleAWSError(error);
            reject(error);
          } else {
            const signedUrls: SignedUrlDTO[] = [];
            const staticPath = `https://ejemplo.s3.amazonaws.com/${path}`;
            for (const obj of url.Contents) {
              // const url = this.s3.getSignedUrl('getObject', {
              //   Bucket: this.awsConfig.bucket,
              //   Key: obj.Key,
              //   ResponseContentType: contentType,
              // });
              const fileName =
                obj.Key.split('/')[obj.Key.split('/').length - 1];
              signedUrls.push({
                url: `${staticPath}${fileName}`,
                key: obj.Key,
              });
            }

            resolve(signedUrls);
          }
        },
      );
    });
  }
}
