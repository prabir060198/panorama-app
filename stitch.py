import cv2
import glob

# load images
images = []
for file in sorted(glob.glob("images/*.jpg")):
    print("Loading:", file)
    img = cv2.imread(file)
    images.append(img)

# create stitcher
stitcher = cv2.Stitcher_create()

status, pano = stitcher.stitch(images)

if status == cv2.Stitcher_OK:
    cv2.imwrite("panorama.jpg", pano)
    print("✅ Panorama created: panorama.jpg")
else:
    print("❌ Stitching failed:", status)