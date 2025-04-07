"use client";

import { LinkIcon, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { ChallengeConfig, ChallengeFile } from "~/server/db/types";

export function FilesForm() {
	const [activeTab, setActiveTab] = useState<"upload" | "link">("upload");
	const [fileName, setFileName] = useState("");
	const [fileUrl, setFileUrl] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { control, setValue } = useFormContext<ChallengeConfig>();
	const files = useWatch({ control, name: "files" });

	const addFile = (file: ChallengeFile) => {
		setValue("files", [...files, file]);
		setFileName("");
		setFileUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeFile = (index: number) => {
		const newFiles = [...files];
		newFiles.splice(index, 1);
		setValue("files", newFiles);
	};

	const handleFileUpload = () => {
		if (
			activeTab === "upload" &&
			fileInputRef.current?.files?.length &&
			fileInputRef.current.files[0]
		) {
			const file = fileInputRef.current.files[0];
			const name = fileName || file.name;

			const fakeUrl = URL.createObjectURL(file);

			addFile({
				name,
				url: fakeUrl,
				isUploaded: true,
				size: file.size,
				type: file.type,
			});
		} else if (activeTab === "link" && fileUrl) {
			try {
				const url = new URL(fileUrl);
				addFile({
					name: fileName || url.pathname.split("/").pop() || "Unnamed File",
					url: fileUrl,
					isUploaded: false,
				});
			} catch (e) {
				addFile({
					name: fileName || "Unnamed File",
					url: fileUrl,
					isUploaded: false,
				});
			}
		}
	};

	const formatFileSize = (bytes = 0) => {
		if (bytes < 1024) return `${bytes} bytes`;
		if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
		if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
		return `${(bytes / 1073741824).toFixed(1)} GB`;
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label>Challenge Files</Label>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="border rounded-md p-4">
					<Tabs
						value={activeTab}
						onValueChange={(value) => setActiveTab(value as "upload" | "link")}
					>
						<TabsList className="mb-4">
							<TabsTrigger value="upload">Upload File</TabsTrigger>
							<TabsTrigger value="link">External Link</TabsTrigger>
						</TabsList>

						<div className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="fileName">File Name (Optional)</Label>
								<Input
									id="fileName"
									placeholder="Enter file name or leave blank to use original filename"
									value={fileName}
									onChange={(e) => setFileName(e.target.value)}
								/>
							</div>

							<TabsContent value="upload" className="mt-0">
								<div className="grid gap-2">
									<Label htmlFor="fileUpload">File</Label>
									<Input id="fileUpload" type="file" ref={fileInputRef} />
								</div>
							</TabsContent>

							<TabsContent value="link" className="mt-0">
								<div className="grid gap-2">
									<Label htmlFor="fileUrl">File URL</Label>
									<Input
										id="fileUrl"
										placeholder="https://example.com/file.zip"
										value={fileUrl}
										onChange={(e) => setFileUrl(e.target.value)}
									/>
								</div>
							</TabsContent>

							<Button type="button" onClick={handleFileUpload}>
								<Plus className="mr-1 h-4 w-4" /> Add File
							</Button>
						</div>
					</Tabs>
				</div>
				{files && files.length === 0 ? (
					<div className="flex justify-center items-center w-full">
						<span>No uploaded files</span>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 gap-2">
						{files?.map((file, index) => (
							<div key={index} className="p-3 border rounded-md h-20">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium truncate">
										{file.name}
									</span>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-6 w-6"
										onClick={() => removeFile(index)}
									>
										<Trash2 className="h-3 w-3" />
									</Button>
								</div>
								<div className="text-xs text-muted-foreground">
									{file.isUploaded ? (
										<div className="flex items-center gap-1">
											<Upload className="h-3 w-3" />
											<span>Uploaded file</span>
											{file.size && <span>({formatFileSize(file.size)})</span>}
										</div>
									) : (
										<div className="flex items-center gap-1">
											<LinkIcon className="h-3 w-3" />
											<span className="truncate">{file.url}</span>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
