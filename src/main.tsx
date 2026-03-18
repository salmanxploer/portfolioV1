import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { bootstrapFirebase } from "@/lib/firebase";
import { ensureBlogsStoredInFirestore } from "@/lib/blogStorage";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const syncBlogsWithRetry = async (attempt = 1): Promise<number> => {
	try {
		return await ensureBlogsStoredInFirestore();
	} catch (error) {
		if (attempt >= 3) {
			throw error;
		}
		await delay(800 * attempt);
		return syncBlogsWithRetry(attempt + 1);
	}
};

void bootstrapFirebase()
	.then(async () => {
		const syncedCount = await syncBlogsWithRetry();
		console.info(`[blogStorage] Firestore sync completed for ${syncedCount} posts.`);
	})
	.catch((error) => {
		console.error("[blogStorage] Startup Firestore sync failed.", error);
	});

createRoot(document.getElementById("root")!).render(<App />);
