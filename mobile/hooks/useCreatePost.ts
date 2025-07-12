import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import * as imagePicker from "expo-image-picker";
import { useApiClient } from "@/utils/api";

export const useCreatePost = () => {
    const [content, setContent] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    const createPostMutation = useMutation({
        mutationFn: async (postData: { content: string; imageUri?: string }) => {
            const formData = new FormData();
            if (postData.content) {
                formData.append("content", postData.content);
            }
            if (postData.imageUri) {
                const uriParts = postData.imageUri.split(".");
                const fileType = uriParts[uriParts.length - 1].toLowerCase();
                
                const mineTypeMap: Record<string, string> = {
                    png: "image/png",
                    gif: "image/gif",
                    webp: "image/webp",
                };
                const mimeType = mineTypeMap[fileType] || "image/jpeg";
                formData.append("image", {
                    uri: postData.imageUri,
                    type: mimeType,
                    name: `post-image.${fileType}`
                } as any);
            }
            return apiClient.post("/posts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: () => {
            setContent("");
            setSelectedImage(null);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            Alert.alert("Success", "Post created successfully!");
        },
        onError: (error) => {
            Alert.alert("Error", "Failed to create post. Please try again.");
        },
    });

    const handleImagePicker = async (useCamera: boolean = false) => {
        const permissionResult = useCamera
            ? await imagePicker.requestCameraPermissionsAsync()
            : await imagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            const source = useCamera ? "camera" : "library";
            Alert.alert(
                "Permission Required",
                `You need to grant permission to access the ${source}. Please enable it in your device settings.`,
                [{ text: "OK" }]
            );
            return;
        }

        const pickerOptions = {
            allowsEditing: true,
            aspect: [1, 1] as [number, number],
            quality: 0.8,
        };

        const pickerResult = useCamera
            ? await imagePicker.launchCameraAsync(pickerOptions)
            : await imagePicker.launchImageLibraryAsync({ ...pickerOptions, mediaTypes: ["images"]});

        if (!pickerResult.canceled) {
            setSelectedImage(pickerResult.assets[0].uri);
        }
        if (pickerResult.canceled) {
            return;
        }
    };

    const createPost = () => {
        if (!content.trim() && !selectedImage) {
            Alert.alert("Empty Post", "Please enter content or select an image to post.");
            return;
        }

        const postData: { content: string; imageUri?: string } = {
            content: content.trim(), 
        };
        if (selectedImage) postData.imageUri = selectedImage;
        createPostMutation.mutate(postData);
    };
    return {
        content,
        setContent,
        selectedImage,
        setSelectedImage,
        isCreatingPost: createPostMutation.isPending,
        pickImageFromGallery: () => handleImagePicker(false),
        takePhoto: () => handleImagePicker(true),
        removeImage: () => setSelectedImage(null),
        createPost,
    };
};