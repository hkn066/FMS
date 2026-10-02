package com.lawoffice.fms.infrastructure.storage;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetObjectArgs;
import io.minio.RemoveObjectArgs;
import java.io.InputStream;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MinioStorageService {

    private final MinioClient minioClient;
    private final String bucket;

    public MinioStorageService(
            MinioClient minioClient,
            @Value("${app.minio.bucket}") String bucket) {
        this.minioClient = minioClient;
        this.bucket = bucket;
    }

    public void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("MinIO bucket created: {}", bucket);
            }
        } catch (Exception e) {
            log.warn("MinIO bucket check failed: {}", e.getMessage());
        }
    }

    public String upload(String folder, String filename, InputStream stream, long size, String contentType) {
        ensureBucketExists();
        String key = folder + "/" + UUID.randomUUID() + "-" + filename;
        return uploadObject(key, stream, size, contentType);
    }

    public String uploadObject(String objectKey, InputStream stream, long size, String contentType) {
        ensureBucketExists();
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .stream(stream, size, -1)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .build());
            return objectKey;
        } catch (Exception e) {
            throw new RuntimeException("Dosya yüklenemedi: " + e.getMessage(), e);
        }
    }

    public InputStream download(String storageKey) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucket)
                    .object(storageKey)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Dosya indirilemedi: " + e.getMessage(), e);
        }
    }

    public void delete(String storageKey) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(storageKey)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Dosya silinemedi: " + e.getMessage(), e);
        }
    }
}
