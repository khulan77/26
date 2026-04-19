import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Хамгаалалттай замууд
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/seller(.*)",
]);

// Чиний нэрлэсэн 'proxy' функц
const proxy = clerkMiddleware(async (auth, req) => {
  // Хэрвээ хэрэглэгч /admin эсвэл /seller руу орвол нэвтрэхийг шаардана
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  // Бусад бүх зам (нүүр хуудас, sign-in, sign-up) нээлттэй үлдэнэ
});

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};