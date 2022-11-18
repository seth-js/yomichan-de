# yomichan-de

<h3>A modified version of Yomichan that works with German.</h3>
 
<h3>Examples:</h3>
 
![1](https://user-images.githubusercontent.com/83692925/202674855-aaf43c6f-1db1-4db9-ad4b-47909ed6adb7.png)
<br><br>
![2](https://user-images.githubusercontent.com/83692925/202674917-36faf680-2dca-4f48-9804-3f31b902c975.png)
<br><br>
![3](https://user-images.githubusercontent.com/83692925/202675062-ad0e30c1-e07d-4e45-ac45-aa2742922e01.png)
<br><br>
![4](https://user-images.githubusercontent.com/83692925/202675134-f8e41a3e-4353-4e62-a5f2-b36e25d68d57.png)

<h3>Instructions (firefox)</h3>
<ol>
 <li>Download the repository, clone it, whatever.</li>
 <li>Download the JSON and two zips from the release section.</li>
 <li>Go to: about:debugging#/runtime/this-firefox</li>
 <li>Click <code>Load Temporary Add-on…</code></li>
 <li>Navigate to the <code>manifest.json</code> in the repository and choose it.
  <br>Yomichan should now be installed.
 </li>
 <li>Head to the bottom of the Yomichan settings page.</li>
 <li>Select <code>Import Settings</code>.</li>
 <li>Choose <code>yomichan-settings-2022-11-18.json</code></li>
 <li>Go to the <code>Dictionaries</code> section and import <code>German Dictionary.zip</code></li>
</ol>

<h3>Instructions (chrome-based)</h3>
<ol>
 <li>Download the repository, clone it, whatever.</li>
 <li>Download the JSON and two zips from the release section.</li>
 <li>Go to: chrome://extensions/</li>
 <li>Turn on <code>Developer mode</code></li>
 <li>Click <code>Load unpacked</code></li>
 <li>Navigate to the folder where <code>manifest.json</code> is in the repository, and select the folder.
  <br>Yomichan should now be installed.
 </li>
 <li>Head to the bottom of the Yomichan settings page.</li>
 <li>Select <code>Import Settings</code>.</li>
 <li>Choose <code>yomichan-settings-2022-11-18.json</code></li>
 <li>Go to the <code>Dictionaries</code> section and import <code>German Dictionary.zip</code></li>
</ol>

Everything should now be set up for Yomichan.
<br><br>
To get the Forvo server working, unzip the `German Forvo` folder from `German Forvo.zip`, and throw it in your Anki addon folder.
Mine's in `C:\Users\[Username]\AppData\Roaming\Anki2\addons21`.
<br><br>
I should also mention that another feature I added is the ability to hear the inflected version of the word you've clicked on. By clicking the sound button while holding the Alt key, it will play the inflected version (ex. hinbekam instead of hinbekommen).

<h3>Notes</h3>
If you are already using Yomichan for Japanese, consider using this extension in a separate browser profile. This is a modified version of Yomichan and the unmodified version will have unintended results.
<br><br>
The dictionary gets data from the Kaikki German Wiktionary rip, and it contains almost ~93,000 lemmas. That sounds like a lot, but there are still cases where you'll encounter a word that doesn't have a definition.
<br><br>
The Firefox extension unfortunately doesn't survive restarts. This means you'll have to add it through the debugging page each time, although your settings and the dictionary will not be lost.
<br><br>
Chrome is planning to drop support for extensions that use Manifest V2. This means that unless the developer for Yomichan updates it by then, Chrome may no longer be supported.
