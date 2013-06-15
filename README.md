Implementation of lanczos resize. The function takes an image object, 
destination width, and the amount of lobes (try 3).  This is syncronous
and works with RGB/RGBa images. Note, you may want to fire this up on
a WebWorker since it will take around 3~5 seconds to run and will block
the UI.
