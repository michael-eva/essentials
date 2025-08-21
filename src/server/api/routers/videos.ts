import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";

export const videosRouter = createTRPCRouter({
  getVideoViewCount: publicProcedure
    .input(
      z.object({
        muxAssetId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { muxAssetId } = input;

      const credentials = `${env.MUX_TOKEN_ID}:${env.MUX_TOKEN_SECRET}`;
      const base64Credentials = Buffer.from(credentials).toString("base64");

      const response = await fetch(
        `https://api.mux.com/data/v1/views?group_by=video_id&filters[]=video_id:${muxAssetId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${base64Credentials}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Mux API error: ${response.status} - ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();

      // Depending on how Mux responds, you may want to extract `total_views` directly
      return data;
    }),
});
