AADITHYAN GOPAKUMAR — PORTFOLIO
Home page + Work gallery

OPEN THIS VERSION
1. Extract the ZIP into a NEW folder on your computer.
2. In VS Code, choose File > Open Folder.
3. Select the extracted Aadithyan_3D_Portfolio folder containing index.html.
4. Right-click index.html and choose Open with Live Server.
5. Close your old preview tab. Choose Work in the new website's navigation.

If you see the old pause/play button, you have the old folder open.
This version has no animation toggle and includes a separate Work page.

WHAT IS INCLUDED
- The black-and-white 3D hero with an automatically rotating sculpture,
  subtle pointer interaction and a scroll-driven fragment effect.
- No pause/play button. Rendering resumes automatically when the hero is
  visible; background tabs and offscreen rendering do not waste resources.
- A separate Work page with animated filters for All work, Posters,
  Video Editing, Blender, Maya and 2D Games.
- Kappiri (2025) under Video Editing, using the exact poster you supplied.
  Your role is shown as Assistant Editor; director: Amith Roy.
- The Unity/C# 2D course project described in your resume.
- Full-size image viewing with Close and Escape; galleries with several
  images also support Previous, Next and arrow keys.
- Expandable project details, support for local video files and optional
  project, video, playable demo, source and Drive links.
- Your Instagram, LinkedIn, Behance and Google Drive folder links.
- Your biography, freelance experience, education, skills and resume PDF.
- Email and phone links, mobile navigation and scroll entry transitions.

ASSETS THAT STILL NEED TO BE ADDED
The supplied Behance profile and Drive folder could not be retrieved in
this environment. Their links are included, but their files were not
imported. Posters, Blender and Maya show "coming soon" until actual project
entries are added. There are no sample images presented as your own work.

Kappiri currently includes its poster and your credit. No film video URL
was supplied, so it does not have a Watch video button yet. The 2D game
entry has its description; add screenshots or a playable build when ready.

YOUR FILES
index.html  — home page, biography, experience, education and skills
works.html  — separate Work page and its static fallback content
content.js  — YOUR LINKS AND PROJECTS; edit this to add your work
styles.css  — theme, layouts, mobile styling and interface animation
script.js   — navigation, filters, media viewer and content rendering
scene.js    — automatic 3D rendering and fragment animation
assets/Aadithyan_Gopakumar_Resume.pdf — your supplied resume
assets/work/kappiri-2025.jpg — your supplied Kappiri poster

No build step, database, API key or paid service is needed.

YOUR PROFILE LINKS
Instagram: https://www.instagram.com/row_650_/
LinkedIn: https://www.linkedin.com/in/aadithyan-gopakumar-87661338a/
Behance: https://www.behance.net/aadigopakumar
Google Drive: https://drive.google.com/drive/folders/1woQAnirxjFxdm8iiiZuDEkIQVixj_ak1?usp=sharing

ADD YOUR NEXT WORK
1. Put exported images or videos in assets/work using simple filenames,
   for example my-poster.jpg, model-front.webp or edit-preview.mp4.
2. Open content.js in VS Code.
3. Add a project object inside the "projects" array, separated from the
   previous object by a comma. Give each project a unique "id".
4. Save, refresh the Work page and select that project's category.

Example structure to fill with YOUR actual title, description and files:

{
  "id": "my-project",
  "title": "Your project title",
  "collection": "posters",
  "category": "Posters",
  "role": "Your role",
  "tools": "Software you used",
  "description": "A short description of your actual work.",
  "details": ["Your contribution.", "Another useful project detail."],
  "image": "./assets/work/my-poster.jpg",
  "imageAlt": "Describe the image for visitors who cannot see it.",
  "imageFit": "contain",
  "images": [],
  "videoFile": "",
  "videoUrl": "",
  "demoUrl": "",
  "sourceUrl": "",
  "driveUrl": "",
  "url": ""
}

Category settings:
"collection": "posters"  +  "category": "Posters"
"collection": "videos"   +  "category": "Video Editing"
"collection": "blender"  +  "category": "Blender"
"collection": "maya"     +  "category": "Maya"
"collection": "games"    +  "category": "2D Games"

The first four projects appear on the home page. Add "featured": false
to an entry to keep it on the Work page only. Reorder projects in content.js
to change their display order. Category buttons update automatically.

ADD SEVERAL IMAGES TO ONE PROJECT
Set "image" to the main cover. Put extra images in "images", for example:
"images": [
  { "src": "./assets/work/model-front.webp", "alt": "Front view" },
  { "src": "./assets/work/model-side.webp", "alt": "Side view" }
]
All images are accessible through the viewer and detail thumbnails.
"imageFit": "contain" keeps the entire image visible. Choose "cover" only
if you want the cover thumbnail cropped to fill its frame.

ADD VIDEOS, GAMES AND LINKS
"videoFile" — local MP4/WebM path for a built-in video player, for example
              "./assets/work/edit-preview.mp4". A direct public video URL
              can also work if the host permits playback.
"videoUrl"  — a real video page, such as your film's YouTube/Vimeo URL.
"demoUrl"   — the URL of your playable game, such as a published itch.io build.
"sourceUrl" — your project repository.
"driveUrl"  — a public Drive link for that specific project's files.
"url"       — a project page, such as an individual Behance project.

Empty fields stay hidden. A Drive sharing page belongs in "driveUrl";
it is not a direct MP4 file. Video page links open the external website.
The decorative 3D animation plays automatically. Actual project videos
have normal playback controls and never autoplay with sound.

EDIT YOUR DETAILS
Update email, phone, phoneDisplay, resume, github or socials in content.js.
Use index.html for biography, education, experience and skill descriptions.
The two HTML files include fallback content for when JavaScript is disabled.
If changing or removing personal information, update that HTML content and
your resume PDF too. Match filename capitalisation exactly on GitHub Pages.

Email opens the visitor's mail application; it does not submit a web form.
The phone link opens a supported calling application. The resume link
downloads your supplied PDF from the assets folder.

UPDATE YOUR EXISTING GITHUB PAGES WEBSITE
Repository:
https://github.com/aadithyangopakumar-droid/aadithyan-3d-portfolio

Upload all SIX website files listed below and the entire assets folder to
the repository folder that currently contains the live index.html:
index.html, works.html, content.js, styles.css, script.js, scene.js

Upload the files INSIDE Aadithyan_3D_Portfolio, not an extra outer folder
or the ZIP itself. Commit your changes and wait for GitHub Pages to deploy.

Your existing address remains:
https://aadithyangopakumar-droid.github.io/aadithyan-3d-portfolio/

This download has not been uploaded to your GitHub account.

VALIDATION AND PREVIEW
JavaScript syntax, local links, page anchors, configuration, bundled media
and archive integrity were checked. Live browser rendering and clicks were
not tested in this environment. Use Live Server to review the final look,
test all filters, open Kappiri's poster, close it with Escape and resize
the window to check the mobile menu before publishing.

Google Fonts fall back to system fonts if unavailable. The optional 3D
scene needs WebGL and internet access to the pinned original dependency:
https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js
If the dependency cannot load, the text, projects and navigation still work.
Preview through Live Server instead of double-clicking the HTML file.
