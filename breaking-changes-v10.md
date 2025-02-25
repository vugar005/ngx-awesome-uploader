# Breaking changes from V10.

1. ```ngx-file-picker ``` renamed to ``` ngx-awesome-uploader ```
2. ```FilePickerAdapter ``` implementation changed. Now you can set BE upload response to body field and use it in item template or removeFile api.
3. ``` FilePreviewModel ``` interface has changed. ```fileId``` field removed and replaced with  ```uploadResponse```  which is basically upload response from BE after file uploaded.
