


package com.TechKun.helper;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;

import org.springframework.web.multipart.MultipartFile;

import java.io.FileOutputStream;
import java.util.Collections;
import java.util.Map;
import java.util.HashMap;

public class GoogleDriveService {

    private static final String SERVICE_ACCOUNT_JSON_PATH = "src/main/resources/product-images.json";
    private static final String DRIVE_FOLDER_ID = "1AUYg3_uoHi3l0vEGshS-2DqFDs6v-csZ";

    private Drive getDriveService() throws Exception {
        GoogleCredential credential = GoogleCredential
                .fromStream(new java.io.FileInputStream(SERVICE_ACCOUNT_JSON_PATH))
                .createScoped(Collections.singleton(DriveScopes.DRIVE));

        return new Drive.Builder(credential.getTransport(), credential.getJsonFactory(), credential)
                .setApplicationName("TechKun E-Commerce")
                .build();
    }

    public Map<String, String> uploadProductImage(MultipartFile multipartFile) throws Exception {
        java.io.File localFile = convertToFile(multipartFile);
        FileContent fileContent = new FileContent(multipartFile.getContentType(), localFile);

        File metadata = new File();
        metadata.setName(multipartFile.getOriginalFilename());
        metadata.setParents(Collections.singletonList(DRIVE_FOLDER_ID));

        Drive drive = getDriveService();
        File uploadedFile = drive.files().create(metadata, fileContent)
                .setFields("id")
                .execute();

        // Make file public
        Permission permission = new Permission()
                .setType("anyone")
                .setRole("reader");
        drive.permissions().create(uploadedFile.getId(), permission).execute();

        String fileId = uploadedFile.getId();
        String imageUrl = "https://drive.google.com/uc?id=" + fileId;

        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", imageUrl);
        response.put("fileId", fileId);

        return response;
    }

    private java.io.File convertToFile(MultipartFile multipartFile) throws Exception {
        String filePath = System.getProperty("java.io.tmpdir") + "/" + multipartFile.getOriginalFilename();
        java.io.File convFile = new java.io.File(filePath);
        try (FileOutputStream fos = new FileOutputStream(convFile)) {
            fos.write(multipartFile.getBytes());
        }
        return convFile;
    }
}
