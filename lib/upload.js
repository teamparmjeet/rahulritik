import cloudinary from "./cloudinary";

export const upload = async (file) => {
    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);

    return new Promise(async (resolve, reject) => {
        await cloudinary.uploader
            .upload_stream(
                {
                    resource_type: "image",
                    folder: "tifa",
                },
                async (error, result) => {
                    if (error) {
                        return reject(error.message);
                    }

                    return resolve(result);
                }
            )
            .end(bytes);
    });
};
