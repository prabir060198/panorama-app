import cv2
import os

folder = "uploads"

images = []

for file in sorted(os.listdir(folder)):
    img = cv2.imread(os.path.join(folder, file))
    if img is not None:
        images.append(img)

stitcher = cv2.Stitcher_create()

status, pano = stitcher.stitch(images)

if status == 0:
    cv2.imwrite("output.jpg", pano)
    print("Stitch success")
else:
    print("Stitch failed:", status)