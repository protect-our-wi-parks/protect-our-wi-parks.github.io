# How Our App Works (for judges, and for us!)

## The big idea

Some plants hurt Wisconsin's nature, and some need our help:
- **Invasive plants** come from other places, spread fast and crowd out Wisconsin's own plants.
- **Endangered plants** are Wisconsin's own plants that are almost gone. The law protects them.

The Wisconsin DNR (Department of Natural Resources) wants people to report both. But most people don't know what they're looking at, or how to report it.

Our app's front page says **"Watch for these plants in Wisconsin!"** and has three big buttons: **🌿 Invasive plants** (our team's 16), **🌸 Endangered plants** (12 protected plants), and **📷 Not sure what it is?** Each plant has a photo and tips on how to spot it. Some invasive cards are **groups** of look-alike plants, like the bush honeysuckles.

## How the information flows

There are two paths:

```
 KNOW IT (100% sure)   🌿🌸 Pick it from a list ──► 📍 Where is it? ──────────────────────────────────► 📮 Report it

 NOT SURE              📷 Take a photo ──► 📍 Where is it? ──► 🤖 AI guesses ──► 📋 On Wisconsin's list? ──► 📮 Report it
                                                               (photo → our helper → Pl@ntNet)
```

1. **Know the plant?** Tap **Invasive plants** or **Endangered plants**. A page pops up with photos. Tap yours: a card shows how to spot it and why it matters. Tap **I found this: report it**. No photo and no AI needed, because you already know.
2. **Not sure?** Tap **Not sure what it is?** and take a photo. We shrink the photo and send it through our **plant helper** to **Pl@ntNet**, a plant-identifying AI made by scientists. It sends back its 3 best guesses, and we check each one against our two lists: 41 invasive plants and 116 endangered or threatened plants.
3. **Where is it?** The phone's GPS finds you, the photo already knows where it was taken, or you tap the map.
4. **Report it:** we show the plant, how you know, and the exact spot, so you can copy them. Then a button opens the DNR's official report page (for an endangered plant, the DNR's rare species form). **You** send the report. The app never sends anything by itself.

## What each file does

| File | In kid words |
|---|---|
| `index.html` | The skeleton: all the screens (front page, photo, map, AI answer, report) plus the pop-up plant list are on one page, and we show one at a time. |
| `style.css` | The clothes: colors, big buttons, and making it fit on any phone. |
| `app.js` | The brain: what happens when you tap each button. It has 10 labeled sections. |
| `invasive-plants.json` | Our list of 41 invasive plants, mostly from the state law called NR 40. |
| `plant-helper.js` | The plant helper. It runs in the cloud (on Cloudflare), keeps the AI key locked up, and passes photos to Pl@ntNet. |
| `endangered-plants.json` | Our list of Wisconsin's endangered and threatened plants, from the state's law (NR 27). |
| `photos/` | The plant photos on the two plant pages. |
| `README.md` | Instructions for grown-ups: running the app, putting it online, adding plants. |
| `EXPLAIN.md` | This file! |
| `claude.md` | Rules we gave the AI coding helper that helped us build the app (like "keep it simple" and "never put names in the code"). |
| `.gitignore` | A list of files that should never be uploaded to GitHub. |
| `.github/workflows/check.yml` | Our robot checker. Every time we save a change on GitHub, a robot checks our files for mistakes (like a missing comma) and shows ✅ or ❌. |

## Words to know

- **Scientific name:** every plant has a two-word name that's the same all over the world, like *Alliaria petiolata* (garlic mustard). The first word is the **genus** (a small group of closely related plants), and the second is the **species** (the exact kind of plant). We match on both words, because some plants in the same genus are native and good!
- **Prohibited:** not common in Wisconsin yet. If we find it early, the DNR can stop it. These reports matter most!
- **Restricted:** already common in parts of Wisconsin. It's against the law to sell it, move it, or plant it.
- **Endangered:** so few are left that the plant could disappear from Wisconsin. It's protected by law.
- **Threatened:** likely to become endangered. Also protected by law.
- **Not regulated:** some plants cause problems but aren't in Wisconsin's invasive plant law. Three on our list are like that: sweet clover, reed canary grass and common mullein. The app labels them honestly and says the DNR may not track them.
- **Group:** some invasive plants have look-alike cousins (like four kinds of bush honeysuckle). One card covers the whole group and lists each kind.
- **Confidence ("% sure"):** how sure the AI is about its guess. Under 20%, we say "The AI isn't sure."
- **API key:** like a library card for the plant AI. It lets us use Pl@ntNet, up to 500 checks a day. It's a secret, so only our plant helper has it.
- **Plant helper:** a tiny program in the cloud that holds the key, like a locker. The app asks the helper, and the helper asks Pl@ntNet.

## Questions judges might ask

**How does the AI know what plant it is?**
Pl@ntNet learned from millions of plant photos that scientists and regular people labeled. It looks for patterns, like leaf shape and flower color, and compares them to what it learned. Then it gives its top guesses and a score for how sure it is.

**What if it's wrong?**
It can be wrong! That's why we always say "**possible** invasive plant" and show how sure the AI is. If it's less than 20% sure, we say "The AI isn't sure." A real expert at the DNR makes the final decision. And if you already know the plant, you don't need the AI at all: tap **Invasive plants** or **Endangered plants** and pick it from the list.

**Where does my photo go?**
If you pick a plant from the list, there's no photo at all. If you use the AI, the photo stays on your phone until the AI step. Then a smaller copy goes through our plant helper to Pl@ntNet to be identified. The helper only passes it along and saves nothing (you can read all of its code in `plant-helper.js`). There's no database, so we never keep your photo. Your location stays on your phone. We show it to you on the last screen so you can copy it into your report. It only leaves your phone if you tap **See this spot on a map** (that opens OpenStreetMap at that spot) or paste it into your DNR report yourself. (Drawing the map means downloading map pictures of your area from OpenStreetMap.)

**Why no login?**
A login means storing people's names and passwords, and keeping those safe is a big job. Our app doesn't need to know who you are to help find invasive plants, so we left it out. Safer and simpler!

**Why don't you send reports to the DNR?**
If the app sent reports by itself, the DNR could get reports from every practice run and every wrong guess. Instead, the app gets everything ready (the plant, how you know, and the exact spot) and opens the DNR's official report page. A person checks it and sends it the DNR's own way.

**How does this help the DNR?**
More people learn what invasive and endangered plants look like, from the plant pages. When someone spots one, they can report it with the exact location in a couple of taps. The DNR gets better reports, the most dangerous invasive plants (like giant hogweed) are clearly marked "report it right away," and endangered plant reports go to the DNR's rare species experts with the spot kept secret.

**How would you make it better?**
- Add more plants to the list (the law lists over 100!)
- Figure out the county, so we can say "prohibited" or "restricted" exactly
- Work fully offline, even after the phone closes the app
- Help people send a report straight to the DNR, with the photo and location filled in
- Use our own team photos on the plant pages
- Add more endangered plant cards (the law lists 130 endangered and threatened plants)
- Work in other states, using their invasive plant lists

**Bonus: How do you keep the AI key safe?**
Our code is public on GitHub, so the key can't go there, because anyone could copy it. Instead, the key is locked inside our plant helper on Cloudflare. Phones never see it. The helper only helps our own website, and only sends photos to Pl@ntNet. If someone tries to misuse it, the worst that can happen is using up the day's 500 free checks. No money is involved, and the key stays secret.

**Bonus: How do you change the app?**
Right on the GitHub website, from any computer. We click a file, click the pencil, make the change, and save. A robot checks our work for mistakes, and the live app updates by itself in about a minute.

**Bonus: Where do the plant photos come from?**
They're real photos from Wikimedia Commons that photographers shared for anyone to use. We credit each photographer in the app's ℹ️ About box, and we removed hidden data (like GPS) from the photos.

**Bonus: Why are some plants "not regulated"?**
Wisconsin's law (NR 40) lists the invasive plants people can't sell, move or plant. Some plants our team watches for, like sweet clover and reed canary grass, still crowd out native plants but aren't in that law. We kept them on our list and labeled them honestly, and we got their facts from the Minnesota DNR and Invasive.org.

**Why do you have endangered plants too? Isn't the app about invasive plants?**
They're two sides of the same problem. Invasive plants crowd out Wisconsin's own plants, and some of those are now endangered. The DNR wants reports of both, so one app helps with both.

**Why does the app say "keep the spot secret"?**
Some people dig up rare plants to sell or plant them. That's why the DNR keeps the spots of endangered plants secret. So for an endangered plant, our app leaves out the map link and reminds you: don't post the spot online, and only share it with the DNR.

**Why does the AI only say "endangered" for its best guess?**
Many common plants look like rare ones. When we tested a photo of common milkweed, the AI said 49% common milkweed and 40% prairie milkweed, which is threatened. If we counted every guess, we'd tell people their common milkweed is endangered! So for endangered plants we only use the AI's best guess. For invasive plants we count all its top guesses, because it's better to check a possible invasive than to miss one.

**What if the AI thinks a garden flower is endangered?**
Some protected plants are also sold for gardens. The AI can't tell a garden plant from a wild one, so the answer says: "Planted in a garden? Then you don't need to report it."

**Bonus: Why show a list of plants first?**
If you already know the plant, you don't need an AI: picking it from the list is 100% certain and faster. The list also teaches people what to watch for before they ever see one. The AI is there for when you're not sure.
