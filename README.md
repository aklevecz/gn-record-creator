TODO

- make sure that image buffer arrays are favored over blobs when saving and loading - this is related to improving the texture saving pipeline
- clean up texture saving pipeline so it is consistent and easy to change destinations in the future
- clean up unify the remote saving so that it can easily be pulled back in if caching is broken
- look everywhere where updateMaterialTexture is referenced