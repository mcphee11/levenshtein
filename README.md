# levenshtein

Informally, the Levenshtein distance between two words is the minimum number of single-character edits (insertions, deletions or substitutions) required to change one word into the other. This can then be used to provide better matching on voice and chat bots when you have a list of "known" items and leverage a ReGex to capture the items. For example If you have a use case where you are building a Voice Bot and need to get a random string of numbers and letters... a license plate, receipt number etc. If you know who the person is based on their originating auth and then have a "list" of receipts, or objects you are trying to get a match on with a BOT. Some other solutions call these "hints".

## Step 1

First of all you need to build out the levenshtein service. For this case im using a library to help make the code smaller. In my example I will provide 2x code examples one for a localhost node server and the second for running as a Google Cloud Function. You could take these examples and put them anywhere as long as there is a https endpoint that the Genesys Cloud solution can find the service for the DataAction to run.

In this readMe im going to be using the cloudfunction version of the code. If you have never used Cloud functions before you can find documentation [here](https://cloud.google.com/functions/docs/create-deploy-gcloud-1st-gen). You can also use as AWS lambda if you prefer.

    code can be found in /cloudfunction/index.js

When you deploy the function ensure that you have enabled HTTPS

![](/docs/images/gcp.png?raw=true)

Make sure you copy down the "Trigger URL" as you will need this soon.

## Step 2

Import the DataAction from [here](/docs/dataActions/Levenshtein.json)

    /docs/dataActions/levenshtein.json

Into your Genesys Cloud environment. Ensure that when you upload this you do it as an external Web Services type.

Once imported update the "Request URL Template" to be the Cloud Function "Trigger" HTTPS URL from the step above.

![](/docs/images/dataAction.png?raw=true)

Now you are ready to test the integration. To do this from the "Test" screen enter in the string you want to send for testing in the "item" input and the "arrayobject" string is a comma delimitated list of items you already have to match based on.

In my example im testing

    item: 1234
    arrayobject: 12345,12356,3466

The response back is:

    score: 1
    match: 12345

![](/docs/images/test.png?raw=true)

The score shows that the closest item in the list was 1 char out and in the match it shows which item it was that got that result. Put in different items and see what results you get. The idea of the score is if you get a "0" then its a perfect match and happy days. If its a "1" then maybe you play a confirmation prompt to confirm that they actually meant the one that came back from the "match" and if its lower then maybe ask for more confirmation data to narrow the search. This really depends on the use case and requirements.

    NOTE I have not enabled auth on this endpoint in production you may want to do that to secure your function.

Now "Save and Publish" the dataAction.

## Step 3

Go into Architect in my case its a "BOT Flow" as im using voice but the concept is the same either way. Inside your BOT create 2x "Slots"

#### 1: That is a "Dynamic List" and give it a name in my case i used

    ReferenceNumber

but you can call it what you like

![](/docs/images/referenceNumberType.png?raw=true)

#### 2: The second slot is a "Regular Expression" i called this one

    SpokenReference

Now depending on your requirements mine was a random 1-6 char string with numbers and letters. But based on your requirements build out the RegEX mine was this. The reason its from 1 - 20 chars is because recently Genesys Cloud changed ot at times transcript "1" as "one" so you need to allow for overheads in the length of the input you require.

    ^[a-zA-Z0-9]{1,20}$

Now to build out the rest of the BOT Flow

## Step 4

Where you need to capture the voice input use a "Ask for Slot" block with reference to the "SpokenReference" we created earlier.

![](/docs/images/spokenInput.png?raw=true)

save the output of this into a variable and to make it easy call it "SpokenReference" as well.

Now you need to put an "Update Data" block to remove any formatting you require eg as mentioned above replace "one" to "1" etc.

For this use the below Value To Assign to the `Slot.SpokenReference`

```
Upper(Replace(Replace(Replace(Replace(Replace(Replace(Replace(Replace(Replace(Replace(Replace(Replace(Slot.SpokenReference, " ", ""), "O", "0"), "ZERO", "0"), "ONE", "1"), "TWO", "2"), "THREE", "3"), "FOUR", "4"), "FIVE", "5"), "SIX", "6"),"SEVEN","7"),"EIGHT","8"),"NINE","9"))
```

In my case I am also forcing ALL chars to `UPPER case`.

![](/docs/images/replace.png?raw=true)

Now straight after that block put in a "Call Data Action" and reference the action we created earlier called "Levenshtein" of Generic Web Services Integration" category.

![](/docs/images/callDataAction.png?raw=true)

From here put the "SpokenReference" as the "item" and then the list of items you have to check against. These could of been captured from a previous lookup or even from a DataTable. either way just ensure this list is comma separated like in the tests we did before.

    item: 12344
    arrayobject: 12345,12356,3466

Then depending on the "score" level you can then do more post treatment in the flow.

## NOTES:

You can send only 1 "hint" or single item in the "list" it does NOT have to be multiply items.

By default I have made this "case sensitive" to not use this simply make both items "lower case" or "upper case" before sending the data:

    Lower(Slot.SpokenReference)
    Lower(Flow.varList)
