// import { NextRequest, NextResponse } from "next/server";
// import { generateAiNotification } from "@/services/ai-notifications";
// import { buildUserContext } from "@/services/context-manager";

// export async function POST(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get("user_id");

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Missing user_id in query parameters" },
//         { status: 400 }
//       );
//     }

//     const userContext = await buildUserContext(userId);
//     const notification = await generateAiNotification(userId, userContext);

//     return NextResponse.json({ notification });
//   } catch (error) {
//     console.error("Error generating AI notification:", error);
//     return NextResponse.json(
//       { error: "Failed to generate AI notification" },
//       { status: 500 }
//     );
//   }
// }