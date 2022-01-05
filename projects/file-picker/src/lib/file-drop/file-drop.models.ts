
export interface UploadEvent {
    files: File[];
 }

 export interface FileSelectResult {

	/** The added files, emitted in the filesAdded event. */
	addedFiles: File[];
}