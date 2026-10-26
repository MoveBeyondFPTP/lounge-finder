/* Lounge Finder */
(function(){
"use strict";
/* ---------------- Reference data ---------------- */
const CARDS = [
  ["amex_plat","American Express Platinum","Centurion Lounges, Sky Club (limited), Priority Pass"],
  ["amex_bizplat","Amex Business Platinum","Same lounge benefits as Platinum"],
  ["amex_centurion","Amex Centurion (black card)","Centurion Lounges, Sky Club, Priority Pass"],
  ["delta_reserve","Delta SkyMiles Reserve (Amex)","Sky Club and Centurion when flying Delta"],
  ["venturex","Capital One Venture X","Capital One Lounges, Priority Pass"],
  ["venturex_biz","Capital One Venture X Business","Capital One Lounges, Priority Pass"],
  ["csr","Chase Sapphire Reserve","Sapphire Lounges, Priority Pass"],
  ["ritz","Ritz-Carlton Card (Chase)","Sapphire Lounges, Priority Pass"],
  ["united_club_card","United Club Card (Chase)","United Club when flying United or Star Alliance"],
  ["citi_exec","Citi AAdvantage Executive","Admirals Club when flying American or oneworld"]
];
const MEMS = [
  ["pp","Priority Pass (from another source)","Bought directly, or from a card not listed above"],
  ["united_club_mem","United Club membership","Paid or with status"],
  ["admirals_mem","Admirals Club membership","Paid or lifetime"],
  ["skyclub_mem","Delta Sky Club membership","Paid, or a Medallion Choice Benefit"],
  ["alaska_mem","Alaska Lounge membership","Paid membership"]
];
const STATUS = [
  ["star","Star Alliance",[["none","None"],["silver","Silver"],["gold","Gold"]],"Gold = United Premier Gold or higher, Air Canada 50K+, Lufthansa Senator, etc."],
  ["oneworld","oneworld",[["none","None"],["ruby","Ruby"],["sapphire","Sapphire"],["emerald","Emerald"]],"Sapphire = AA Platinum / Platinum Pro, Alaska Atmos Gold. Emerald = AA Executive Platinum, Atmos Titanium."],
  ["skyteam","SkyTeam",[["none","None"],["elite","Elite"],["eliteplus","Elite Plus"]],"Elite Plus = Delta Gold Medallion or higher, Flying Blue Gold+, etc."]
];
const SPEND = [
  ["spend_amex","$75k spent on my Amex Platinum (this year or last)","2 free guests at Centurion Lounges and unlimited Sky Club visits"],
  ["spend_capone","$75k+ on my Venture X account","2 free guests at Capital One Lounges"]
];
const AIRLINES = [
  ["UA","United","star"],["AA","American","oneworld"],["DL","Delta","skyteam"],["AS","Alaska","oneworld"],
  ["WN","Southwest",""],["B6","JetBlue",""],["F9","Frontier",""],["NK","Spirit",""],
  ["AC","Air Canada","star"],["LH","Lufthansa","star"],["LX","Swiss","star"],["OS","Austrian","star"],["NH","ANA","star"],["SQ","Singapore Airlines","star"],["TK","Turkish Airlines","star"],["NZ","Air New Zealand","star"],
  ["BA","British Airways","oneworld"],["IB","Iberia","oneworld"],["QF","Qantas","oneworld"],["CX","Cathay Pacific","oneworld"],["JL","Japan Airlines","oneworld"],["QR","Qatar Airways","oneworld"],
  ["AF","Air France","skyteam"],["KL","KLM","skyteam"],["VS","Virgin Atlantic","skyteam"],["KE","Korean Air","skyteam"],["AM","Aeroméxico","skyteam"],
  ["EK","Emirates",""],["EY","Etihad",""],["XX","Other airline",""]
];
const ALLIANCE_NAME = {star:"Star Alliance",oneworld:"oneworld",skyteam:"SkyTeam"};
/* Live rules: built-in copy (used offline or before the live store answers), replaced by the store's rules/current */
const BUILTIN_RULES = {"airports": {"ATL": "Atlanta Hartsfield-Jackson", "BOS": "Boston Logan", "CLT": "Charlotte Douglas", "DCA": "Washington Reagan National", "DEN": "Denver International", "DFW": "Dallas Fort Worth", "DTW": "Detroit Metro", "EWR": "Newark Liberty", "IAD": "Washington Dulles", "IAH": "Houston Bush Intercontinental", "JFK": "New York JFK", "LAS": "Las Vegas Harry Reid", "LAX": "Los Angeles", "LGA": "New York LaGuardia", "LHR": "London Heathrow", "MIA": "Miami", "MSP": "Minneapolis–St. Paul", "ORD": "Chicago O'Hare", "PDX": "Portland", "PHL": "Philadelphia", "PHX": "Phoenix Sky Harbor", "SAN": "San Diego", "SEA": "Seattle-Tacoma", "SFO": "San Francisco", "SLC": "Salt Lake City", "BDL": "Hartford Bradley", "CLE": "Cleveland Hopkins", "CMH": "Columbus John Glenn", "CVG": "Cincinnati/Northern Kentucky", "GSP": "Greenville-Spartanburg", "GUM": "Guam", "HNL": "Honolulu", "MCI": "Kansas City", "MCO": "Orlando", "MSY": "New Orleans", "OAK": "Oakland", "PIT": "Pittsburgh", "PVD": "Providence", "SJU": "San Juan", "SMF": "Sacramento", "STL": "St. Louis", "SYR": "Syracuse", "TUL": "Tulsa", "XNA": "Northwest Arkansas", "AUS": "Austin", "FLL": "Fort Lauderdale", "RDU": "Raleigh-Durham", "BNA": "Nashville", "PBI": "Palm Beach", "SNA": "Orange County (John Wayne)", "TPA": "Tampa", "ANC": "Anchorage", "RNO": "Reno-Tahoe", "SAT": "San Antonio"}, "lounges": [{"airport": "ATL", "location": "Every concourse (T, A, B, C, D, E, F)", "network": "skyclub"}, {"airport": "ATL", "location": "", "network": "centurion"}, {"airport": "BOS", "location": "Terminal B, near Gate B40", "network": "sapphire"}, {"airport": "BOS", "location": "Terminal A", "network": "skyclub"}, {"airport": "BOS", "location": "Terminal E, inside the Sky Club", "network": "deltaone"}, {"airport": "BOS", "location": "Terminal B", "network": "admirals"}, {"airport": "BOS", "location": "Terminal B", "network": "united_club"}, {"airport": "CLT", "location": "", "network": "centurion"}, {"airport": "CLT", "location": "Several concourses", "network": "admirals"}, {"airport": "DCA", "location": "", "network": "centurion"}, {"airport": "DCA", "location": "Terminal 2, National Hall, near Concourse D", "network": "capone_landing"}, {"airport": "DCA", "location": "Terminal 2", "network": "admirals"}, {"airport": "DCA", "location": "", "network": "skyclub"}, {"airport": "DCA", "location": "", "network": "united_club"}, {"airport": "DEN", "location": "Concourse C", "network": "centurion"}, {"airport": "DEN", "location": "Concourse A, near Gate 34 (mezzanine)", "network": "capone"}, {"airport": "DEN", "location": "Concourses A and B (several)", "network": "united_club"}, {"airport": "DEN", "location": "", "network": "skyclub"}, {"airport": "DFW", "location": "Terminal D", "network": "centurion"}, {"airport": "DFW", "location": "Terminal D, near Gate 22", "network": "capone"}, {"airport": "DFW", "location": "Terminal D, near Gate D25", "network": "sapphire"}, {"airport": "DFW", "location": "Every terminal", "network": "admirals"}, {"airport": "DFW", "location": "Terminal D, near Gate D23", "network": "flagship"}, {"airport": "DFW", "location": "Terminal E", "network": "skyclub"}, {"airport": "DTW", "location": "McNamara Terminal (several)", "network": "skyclub"}, {"airport": "EWR", "location": "Terminals A and C", "network": "united_club"}, {"airport": "EWR", "location": "Terminal C", "network": "polaris"}, {"airport": "IAD", "location": "Main terminal past security (reach from the Z gates)", "network": "capone"}, {"airport": "IAD", "location": "Concourses C and D", "network": "united_club"}, {"airport": "IAD", "location": "Concourse C", "network": "polaris"}, {"airport": "IAH", "location": "Terminal D", "network": "centurion"}, {"airport": "IAH", "location": "Terminals C and E", "network": "united_club"}, {"airport": "IAH", "location": "Terminal E", "network": "polaris"}, {"airport": "JFK", "location": "Terminal 4", "network": "centurion"}, {"airport": "JFK", "location": "Terminal 4, Level 3 Retail Hall, near B gates", "network": "capone"}, {"airport": "JFK", "location": "Terminal 4, near Gate A2", "network": "sapphire", "note": "Temporarily closed", "status": "closed"}, {"airport": "JFK", "location": "Terminal 4", "network": "skyclub"}, {"airport": "JFK", "location": "Terminal 4", "network": "deltaone"}, {"airport": "JFK", "location": "Terminal 8", "network": "admirals"}, {"airport": "LAS", "location": "Concourse D", "network": "centurion"}, {"airport": "LAS", "location": "Concourse D Atrium, near Gate D50", "network": "capone"}, {"airport": "LAS", "location": "Terminal 1, near Gate C23", "network": "sapphire"}, {"airport": "LAX", "location": "Tom Bradley International Terminal", "network": "centurion"}, {"airport": "LAX", "location": "Terminals 2 and 3", "network": "skyclub"}, {"airport": "LAX", "location": "Terminal 3", "network": "deltaone"}, {"airport": "LAX", "location": "Terminal 7", "network": "united_club"}, {"airport": "LAX", "location": "Terminal 7", "network": "polaris"}, {"airport": "LAX", "location": "Terminal 4", "network": "admirals"}, {"airport": "LAX", "location": "Terminal 4, near Gate 41", "network": "flagship"}, {"airport": "LAX", "location": "Terminal 6", "network": "alaska"}, {"airport": "LGA", "location": "Terminal B", "network": "centurion"}, {"airport": "LGA", "location": "Terminal B, on the bridge before Gates 40–59", "network": "sapphire"}, {"airport": "LGA", "location": "Terminal B, on the bridge to Gates 11–31", "network": "capone_landing"}, {"airport": "LGA", "location": "Terminal C", "network": "skyclub"}, {"airport": "LGA", "location": "Terminal B", "network": "united_club"}, {"airport": "LGA", "location": "Terminal B", "network": "admirals"}, {"airport": "LHR", "location": "Terminal 2", "network": "united_club"}, {"airport": "LHR", "location": "Terminal 3", "network": "flagship"}, {"airport": "MIA", "location": "Concourse D", "network": "centurion"}, {"airport": "MIA", "location": "Concourse D", "network": "admirals"}, {"airport": "MIA", "location": "Concourse D, near Gate D30", "network": "flagship"}, {"airport": "MSP", "location": "Concourses C, F and G", "network": "skyclub"}, {"airport": "ORD", "location": "Terminals 1 and 2", "network": "united_club"}, {"airport": "ORD", "location": "Terminal 1, Concourse C", "network": "polaris"}, {"airport": "ORD", "location": "Terminal 3", "network": "admirals"}, {"airport": "ORD", "location": "Terminal 3, Concourse H/K", "network": "flagship"}, {"airport": "ORD", "location": "", "network": "skyclub"}, {"airport": "PDX", "location": "", "network": "alaska"}, {"airport": "PHL", "location": "Terminal A-West", "network": "centurion"}, {"airport": "PHL", "location": "Terminal D/E connector", "network": "sapphire"}, {"airport": "PHL", "location": "Several terminals", "network": "admirals"}, {"airport": "PHL", "location": "Terminal A West, mezzanine between Gates A15 and A16", "network": "flagship"}, {"airport": "PHX", "location": "Terminal 4", "network": "centurion"}, {"airport": "PHX", "location": "Terminal 4, near Gate D11", "network": "sapphire"}, {"airport": "PHX", "location": "Terminal 4", "network": "admirals"}, {"airport": "PHX", "location": "", "network": "skyclub"}, {"airport": "SAN", "location": "Terminal 2, near Gates 46–47", "network": "sapphire"}, {"airport": "SEA", "location": "", "network": "centurion"}, {"airport": "SEA", "location": "", "network": "skyclub"}, {"airport": "SEA", "location": "Concourse A, near Gate A11 (level 4)", "network": "deltaone"}, {"airport": "SEA", "location": "Concourses C, D and North Satellite", "network": "alaska"}, {"airport": "SFO", "location": "Terminal 2, near Gate D12 (temporary space)", "network": "centurion", "note": "Main Terminal 3 lounge closed for renovation until 2027"}, {"airport": "SFO", "location": "Terminal 3", "network": "united_club"}, {"airport": "SFO", "location": "International Terminal G", "network": "polaris"}, {"airport": "SFO", "location": "Terminal 2", "network": "alaska", "note": "Closed; its Terminal 2 space now holds the temporary Centurion Lounge", "status": "closed"}, {"airport": "SFO", "location": "", "network": "admirals"}, {"airport": "SFO", "location": "", "network": "skyclub"}, {"airport": "SLC", "location": "", "network": "centurion"}, {"airport": "SLC", "location": "Concourses A and B", "network": "skyclub"}, {"airport": "IAD", "location": "Concourse A, near Gate A14", "network": "sapphire", "note": "Etihad Lounge; Sapphire Reserve and Ritz-Carlton cardholders get in"}, {"airport": "ATL", "network": "prioritypass", "location": "Concourse F, mezzanine level, next to the chapel", "status": "open", "name": "The Club ATL"}, {"airport": "ATL", "network": "prioritypass", "location": "Concourse F, next to The Club", "status": "open", "name": "Poppin"}, {"airport": "BDL", "network": "prioritypass", "location": "Terminal A", "status": "open"}, {"airport": "BOS", "network": "prioritypass", "location": "Terminal E", "status": "open"}, {"airport": "BOS", "network": "prioritypass", "location": "Terminal C", "status": "open"}, {"airport": "CLE", "network": "prioritypass", "location": "Concourse B, follow signs after security", "status": "open"}, {"airport": "CLT", "network": "prioritypass", "location": "Concourse A", "status": "open"}, {"airport": "CMH", "network": "prioritypass", "location": "Concourse B", "status": "open"}, {"airport": "CVG", "network": "prioritypass", "location": "Concourse B", "status": "open"}, {"airport": "CVG", "network": "prioritypass", "location": "Concourse A", "status": "open"}, {"airport": "DFW", "network": "prioritypass", "location": "Terminal E", "status": "open", "name": "Plaza Premium Lounge"}, {"airport": "DFW", "network": "prioritypass", "location": "Terminal D", "status": "open", "name": "The Club DFW"}, {"airport": "GSP", "network": "prioritypass", "location": "Concourse B, ground level under Gate B1", "status": "open"}, {"airport": "GUM", "network": "prioritypass", "location": "Main Terminal", "status": "open"}, {"airport": "HNL", "network": "prioritypass", "location": "Terminal 2, Garden Court area near Gates 14–23", "status": "open"}, {"airport": "HNL", "network": "prioritypass", "location": "Terminal 1, near Gate A18", "status": "open"}, {"airport": "IAD", "network": "prioritypass", "location": "Concourse A", "status": "open", "name": "Virgin Atlantic Clubhouse"}, {"airport": "IAD", "network": "prioritypass", "location": "Concourse A", "status": "open", "name": "Air France–KLM Lounge"}, {"airport": "IAD", "network": "prioritypass", "location": "Concourse B", "status": "open", "name": "Turkish Airlines Lounge"}, {"airport": "IAH", "network": "prioritypass", "location": "Terminal D, opposite Gate D18B", "status": "open"}, {"airport": "IAH", "network": "prioritypass", "location": "Terminal D, near Gate D16", "status": "open"}, {"airport": "JFK", "network": "prioritypass", "location": "Terminal 4, above Gates A4 and A5", "status": "open", "name": "Virgin Atlantic Clubhouse"}, {"airport": "JFK", "network": "prioritypass", "location": "Terminal 4, Level 4", "status": "open", "name": "Air India Lounge"}, {"airport": "JFK", "network": "prioritypass", "location": "Terminal 1, across from Gate 3", "status": "open", "name": "Korean Air Lounge"}, {"airport": "JFK", "network": "prioritypass", "location": "Terminal 1, between Gates 2 and 3 (international flights only)", "status": "open", "name": "Turkish Airlines Lounge"}, {"airport": "JFK", "network": "prioritypass", "location": "Terminal 1, near Gate 1", "status": "open", "name": "Air France Lounge"}, {"airport": "JFK", "network": "prioritypass", "location": "Terminal 1, after security", "status": "open", "name": "Lufthansa Business Lounge", "note": "Limited days: check before you go"}, {"airport": "JFK", "network": "prioritypass", "location": "Terminal 1, near Gates 8 and 9", "status": "open", "name": "Primeclass Lounge"}, {"airport": "JFK", "network": "prioritypass", "location": "Terminal 1, before security behind counters E and F (international flights only)", "status": "open", "name": "VIP ONE Lounge"}, {"airport": "LAS", "network": "prioritypass", "location": "Terminal 3, opposite Gate E2", "status": "open"}, {"airport": "LAS", "network": "prioritypass", "location": "Terminal 1, Level 2 (train to the D gates)", "status": "open"}, {"airport": "LAX", "network": "prioritypass", "location": "Tom Bradley International Terminal, 6th floor (lift near the clock tower)", "status": "open"}, {"airport": "MCI", "network": "prioritypass", "location": "Concourse A, near Gate A5", "status": "open", "name": "Escape Lounge"}, {"airport": "MCO", "network": "prioritypass", "location": "Terminal C", "status": "open"}, {"airport": "MCO", "network": "prioritypass", "location": "Terminal B, Concourse 4", "status": "open"}, {"airport": "MCO", "network": "prioritypass", "location": "Terminal A, Concourse 1", "status": "open"}, {"airport": "MIA", "network": "prioritypass", "location": "South Terminal (H and J gates), opposite Gate J6", "status": "open"}, {"airport": "MIA", "network": "prioritypass", "location": "South Terminal (H and J gates), 3rd floor", "status": "open"}, {"airport": "MIA", "network": "prioritypass", "location": "North Terminal (D and E gates), Level 2", "status": "open"}, {"airport": "MSP", "network": "prioritypass", "location": "Terminal 1", "status": "open"}, {"airport": "MSY", "network": "prioritypass", "location": "Concourse A, 3rd floor", "status": "open"}, {"airport": "OAK", "network": "prioritypass", "location": "Terminal 1, between Gates 8 and 8A", "status": "open"}, {"airport": "ORD", "network": "prioritypass", "location": "Terminal 5", "status": "open", "name": "Wingtips Lounge"}, {"airport": "ORD", "network": "prioritypass", "location": "Terminal 5", "status": "open", "name": "Swissport Lounge"}, {"airport": "ORD", "network": "prioritypass", "location": "Terminal 5", "status": "open", "name": "Air France Lounge"}, {"airport": "PDX", "network": "prioritypass", "location": "Concourse D", "status": "open"}, {"airport": "PHX", "network": "prioritypass", "location": "Terminal 3", "status": "open"}, {"airport": "PIT", "network": "prioritypass", "location": "Concourse C", "status": "open"}, {"airport": "PVD", "network": "prioritypass", "location": "North Concourse, between Gates 18 and 20", "status": "open"}, {"airport": "SAN", "network": "prioritypass", "location": "Terminal 2", "status": "open"}, {"airport": "SEA", "network": "prioritypass", "location": "South Satellite, above Gate S9", "status": "open"}, {"airport": "SEA", "network": "prioritypass", "location": "Concourse A, opposite Gate A11", "status": "open"}, {"airport": "SFO", "network": "prioritypass", "location": "Terminal 1", "status": "open"}, {"airport": "SFO", "network": "prioritypass", "location": "International Terminal A", "status": "open"}, {"airport": "SJU", "network": "prioritypass", "location": "Terminal C, 3rd floor", "status": "open"}, {"airport": "SJU", "network": "prioritypass", "location": "Terminal B, past Duty Free", "status": "open"}, {"airport": "SJU", "network": "prioritypass", "location": "Terminal A, past Duty Free", "status": "open"}, {"airport": "SMF", "network": "prioritypass", "location": "Terminal B", "status": "open"}, {"airport": "SMF", "network": "prioritypass", "location": "Terminal A", "status": "open"}, {"airport": "STL", "network": "prioritypass", "location": "Terminal 2, opposite Gate E29", "status": "open"}, {"airport": "SYR", "network": "prioritypass", "location": "Terminal A", "status": "open"}, {"airport": "TUL", "network": "prioritypass", "location": "After security", "status": "open"}, {"airport": "XNA", "network": "prioritypass", "location": "After security", "status": "open"}, {"airport": "MCI", "network": "skyclub", "location": "B gates, next to CenterPoint", "status": "open"}, {"airport": "MCI", "network": "amexpartner", "location": "Concourse A, near Gate A5", "status": "open", "name": "Escape Lounge"}, {"airport": "DFW", "network": "amexpartner", "location": "Terminal D, international departures", "status": "open", "name": "Plaza Premium Lounge"}, {"airport": "DFW", "network": "amexpartner", "location": "Terminal E", "status": "open", "name": "Plaza Premium Lounge"}, {"airport": "DFW", "network": "united_club", "location": "Terminal E, between Gates E6 and E7", "status": "open"}, {"airport": "ATL", "network": "united_club", "location": "North Terminal, between Gates 11 and 12", "status": "open"}, {"airport": "ATL", "network": "admirals", "location": "Terminal T, across from Gate T11", "status": "open"}, {"airport": "LAX", "network": "starpartner", "name": "Air Canada Maple Leaf Lounge", "location": "Terminal 6", "status": "open"}, {"airport": "LAX", "network": "starpartner", "name": "Star Alliance Lounge", "location": "Tom Bradley International Terminal, reachable airside from Terminals 4–8", "status": "open", "note": "A walk from United's gates, but no second security check."}, {"airport": "LGA", "network": "starpartner", "name": "Air Canada Maple Leaf Lounge", "location": "Terminal B, Eastern Concourse", "status": "open"}, {"airport": "SFO", "network": "starpartner", "name": "Air Canada Maple Leaf Lounge", "location": "Terminal 2", "status": "open", "note": "United's domestic gates are in Terminal 3; check you can walk there airside."}, {"airport": "EWR", "network": "starpartner", "name": "Air Canada Maple Leaf Lounge", "location": "Terminal A (check the Air Canada app)", "status": "open", "note": "May require clearing security again if your United flight leaves from Terminal C."}], "meta": {"changelog": [{"date": "2026-10-25", "text": "Guest rules by age added for every lounge network: infants under 2 are free at Centurion, Capital One, Sapphire, Sky Club, United Club and Alaska lounges; enter your guests on the trip form to see costs and limits."}, {"date": "2026-10-25", "text": "Added Star Alliance partner lounges (Air Canada Maple Leaf at LAX, LGA, SFO and EWR; Star Alliance Lounge at LAX), open to Star Alliance Gold on any Star flight including domestic United, and to United Club All Access members. All Access now shows 2 guests."}, {"date": "2026-10-25", "text": "Delta and American checked against their own sites: Sky Clubs now open to members and Amex cardholders on arrival; Delta Medallion vs. partner SkyTeam status handled separately; oneworld status from non-American airlines works on domestic flights; Sapphire and Emerald status now shows Flagship Lounges on international trips; JFK Flagship removed (it's now the Chelsea Lounge)."}, {"date": "2026-10-25", "text": "United Clubs now show as open to members and United Club cardholders when you're arriving, not just departing."}, {"date": "2026-10-25", "text": "Added every US Priority Pass lounge (60 venues at 36 airports) so results name them instead of linking out; added Amex partner lounges (Escape, Plaza Premium) and missing lounges at Kansas City, Dallas and Atlanta."}, {"date": "2026-10-25", "text": "Checked all networks. Centurion card guests now include family; Polaris partner list adds ITA and Brussels; Star Alliance Gold guests must be on your flight; Delta One Basic fares lose access Jan 19, 2027 (notice); updated guest rules for Admirals, Alaska and Flagship; fixed Sapphire, Delta One and SFO lounge locations, added the IAD Etihad/Sapphire lounge, marked the SFO Alaska Lounge closed."}, {"date": "2026-10-25", "text": "Rules moved to a live data store. Items marked unverified will be checked on the first refresh."}], "needsAppUpdate": ["Delta One: from Jan 19, 2027, Delta One Basic fares lose lounge access; the app has no field to exclude a fare type for this network."], "nextCheck": "Every Monday morning", "updatedAt": "2026-10-25", "updatedBy": "Automatic refresh"}, "networks": {"admirals": {"dayPass": "Day passes ($79 or 7,900 miles) are sold in the American app when space allows.", "extraLimits": ["No time limit before departure.", "Arriving passengers are welcome with a same-day American or oneworld boarding pass."], "guestsCitiExec": "Up to 2 guests or your immediate family.", "guestsMembership": "Up to 2 guests or your immediate family.", "guestsStatus": "1 guest.", "name": "Admirals Club", "notices": [], "operator": "American Airlines", "sources": [{"title": "American Airlines: Admirals Club access", "url": "https://www.aa.com/i18n/travel-info/clubs/admirals-club-access.html"}, {"title": "American Airlines: Admirals Club access", "url": "https://www.aa.com/web/i18n/travel-info/clubs/admirals-club-access.html"}], "statusInternationalOnly": true, "unverified": [], "verified": "2026-10-25", "guestPolicies": {"membership": {"free": 2, "max": 2, "fee": null, "childAges": [2, 17], "familyUnder": 18, "familyFree": true, "familyAdults": 1, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "citiExec": {"free": 2, "max": 2, "fee": null, "childAges": [2, 17], "familyUnder": 18, "familyFree": true, "familyAdults": 1, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "status": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "intlFirst": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "premium": {"free": 0, "max": 0, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}}}, "alaska": {"extraLimits": ["Atmos and oneworld status only gets you in on international trips (outside the U.S., Canada and Mexico).", "Some lounges limit access during busy periods."], "guestsMembership": "Your partner and children under 21, or up to 2 friends.", "guestsStatus": "1 guest flying oneworld with you.", "name": "Alaska Lounge", "noAccessHint": "Single-entry passes ($35) are sold at the door when space allows.", "notices": [], "operator": "Alaska Airlines", "sources": [{"title": "Alaska Airlines: Lounge policies and rules", "url": "https://www.alaskaair.com/content/airport-lounge/policies-and-rules"}], "unverified": [], "verified": "2026-10-25", "guestPolicies": {"membership": {"free": 2, "max": 2, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "status": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "premium": {"free": 0, "max": 0, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}}}, "capone": {"arrivals": false, "authorizedUsers": "Authorized users need the $125/year lounge add-on.", "bringCard": "Your physical Venture X card", "cards": ["venturex", "venturex_biz"], "connectAnyTime": true, "entryHoursBefore": 3, "extraLimits": [], "guests": "$45 per adult guest, $25 ages 2–17, under 2 free.", "guestsAfterSpend": "2 guests free (you've hit $75k spend).", "name": "Capital One Lounge", "noAccessHint": "Non-cardholders can pay $90 per visit.", "notices": [], "operator": "Capital One", "sources": [{"title": "One Mile at a Time: Venture X lounge access changes", "url": "https://onemileatatime.com/news/capital-one-venture-x-lounge-access-changes/"}, {"title": "AwardWallet: Capital One lounges", "url": "https://awardwallet.com/credit-cards/capital-one-rewards/capital-one-airport-lounges/"}], "unverified": [], "verified": "2026-10-25", "guestPolicies": {"card": {"free": 0, "max": null, "fee": {"adult": 45, "child": 25}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "freeAfterSpend": 2, "spendKey": "spend_capone", "infantUnder": 2, "infantSure": true}}}, "capone_landing": {"arrivals": false, "authorizedUsers": "Authorized users need the $125/year lounge add-on.", "bringCard": "Your physical Venture X card", "cards": ["venturex", "venturex_biz"], "connectAnyTime": true, "entryHoursBefore": 3, "extraLimits": ["Landings are smaller, food-focused spaces."], "guests": "$45 per adult guest, $25 ages 2–17, under 2 free.", "guestsAfterSpend": "1 guest free (you've hit $75k spend).", "name": "Capital One Landing", "noAccessHint": "Non-cardholders can pay $90 per visit.", "notices": [], "operator": "Capital One", "sources": [{"title": "One Mile at a Time: Capital One Landing guide", "url": "https://onemileatatime.com/guides/capital-one-landing/"}, {"title": "AwardWallet: Capital One lounges", "url": "https://awardwallet.com/credit-cards/capital-one-rewards/capital-one-airport-lounges/"}], "unverified": [], "verified": "2026-10-25", "guestPolicies": {"card": {"free": 0, "max": null, "fee": {"adult": 45, "child": 25}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "freeAfterSpend": 1, "spendKey": "spend_capone", "infantUnder": 2, "infantSure": true}}}, "centurion": {"arrivals": false, "bringCard": "Your physical Amex card", "cards": ["amex_plat", "amex_bizplat", "amex_centurion"], "connectHoursBefore": 5, "deltaReserveWhenFlyingDelta": true, "entryHoursBefore": 3, "extraLimits": ["May pause new entries when full."], "guests": "$50 per adult, $30 ages 2–17. Free for 2 guests after $75,000 annual spend. Guests must be on your same flight.", "guestsAfterSpend": "2 guests free (you've hit $75k spend). Guests must be on your flight.", "guestsCenturionCard": "Your immediate family plus 2 guests free.", "name": "The Centurion Lounge", "noAccessHint": "Day passes aren't sold. Delta Reserve cardholders get in when flying Delta.", "notices": [], "operator": "American Express", "sources": [{"title": "American Express: Centurion Lounge access policy", "url": "https://www.thecenturionlounge.com/info/access/"}, {"title": "One Mile at a Time: Centurion Lounges add new restrictions", "url": "https://onemileatatime.com/news/amex-centurion-lounges-new-access-restrictions/"}, {"title": "Upgraded Points: New Centurion entry rules start July 8", "url": "https://upgradedpoints.com/news/amex-centurion-lounge-new-entry-rules-2026/"}], "unverified": [], "verified": "2026-10-25", "guestPolicies": {"plat": {"free": 0, "max": null, "fee": {"adult": 50, "child": 30}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": true, "freeAfterSpend": 2, "spendKey": "spend_amex", "infantUnder": 2, "infantSure": true}, "centurionCard": {"free": 2, "max": null, "fee": {"adult": 50, "child": 30}, "childAges": [2, 17], "familyUnder": 18, "familyFree": true, "familyAdults": 1, "sameFlight": true, "infantUnder": 2, "infantSure": true}, "deltaReserve": {"free": 0, "max": 2, "fee": {"adult": 50, "child": 30}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": true, "infantUnder": 2, "infantSure": true}}}, "deltaone": {"arrivals": true, "extraLimits": ["Sky Club memberships and Amex cards don't work here.", "Only Delta 360° members can bring guests ($100 each)."], "name": "Delta One Lounge", "notices": ["From January 19, 2027: Delta One Basic (cheapest business) fares no longer include Delta One Lounge access."], "operator": "Delta", "sources": [{"title": "The Points Party: Delta One Lounge access", "url": "https://thepointsparty.com/articles/delta-one-lounge-access-guide"}, {"title": "Upgraded Points: Delta One Lounge locations", "url": "https://upgradedpoints.com/travel/airports/delta-one-lounges/"}, {"title": "The Points Guy: Delta Basic premium fares", "url": "https://thepointsguy.com/airline/delta-air-lines-basic-tickets-premium-seats-what-to-know/"}], "unverified": [], "verified": "2026-10-25", "guestPolicies": {"ticket": {"free": 0, "max": 0, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}}}, "flagship": {"arrivals": true, "extraLimits": ["Status holders can use Flagship Lounges when departing, connecting or arriving."], "guestsEmerald": "1 guest flying oneworld with you.", "guestsPremium": "No guests.", "name": "Flagship Lounge", "notices": [], "operator": "American Airlines", "sources": [{"title": "American Airlines: Flagship lounge", "url": "https://www.aa.com/i18n/travel-info/clubs/flagship-lounge.html"}], "unverified": [], "verified": "2026-10-25", "statusTiers": ["sapphire", "emerald"], "partnerStatusAnyFlight": true, "statusArrivals": true, "guestsStatus": "1 guest.", "guestsIntlFirst": "1 guest.", "guestPolicies": {"status": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "intlFirst": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "premium": {"free": 0, "max": 0, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}}}, "polaris": {"arrivals": true, "extraLimits": ["United Polaris Base fares are excluded.", "Partner-airline passengers get in only when departing, not on arrival."], "firstClassGuestAirlines": ["LH", "LX", "NH"], "name": "United Polaris Lounge", "notices": [], "operator": "United", "partnerBusinessAirlines": ["LH", "LX", "OS", "SN", "NH", "NZ", "AZ"], "sources": [{"title": "Prince of Travel: United restricts Polaris access for partners", "url": "https://princeoftravel.com/news/united-restricts-polaris-lounge-access-star-alliance/"}, {"title": "Air Traveler Club: Polaris limited to five partners", "url": "https://www.airtraveler.club/news/united-restricts-polaris-lounge-access/"}], "unverified": ["Arrivals access for United Polaris passengers"], "verified": "2026-10-25", "guestPolicies": {"ticket": {"free": 0, "max": 0, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "firstPartner": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}}}, "prioritypass": {"cards": ["csr", "ritz", "venturex", "venturex_biz", "amex_plat", "amex_bizplat", "amex_centurion", "pp"], "extraLimits": ["Your credit card alone won't work. Activate the Priority Pass membership on your card's website first.", "Most lounges admit you up to 3 hours before departure and can refuse entry when full.", "Airport restaurants in Priority Pass aren't included with Sapphire Reserve, Ritz-Carlton, Venture X or Amex cards.", "Chase Sapphire Lounges are no longer open to Priority Pass members from other cards."], "guestsByCard": {"amex_bizplat": "2 guests free.", "amex_centurion": "2 guests free.", "amex_plat": "2 guests free.", "csr": "2 guests free.", "pp": "Depends on your plan.", "ritz": "2 guests free.", "venturex": "$35 per guest.", "venturex_biz": "2 guests free."}, "name": "Priority Pass lounge", "notices": [], "operator": "Priority Pass", "sources": [{"title": "The Points Party: Priority Pass lounges by airport", "url": "https://thepointsparty.com/loyalty-programs/lounges/priority-pass"}, {"title": "One Mile at a Time: Venture X lounge access changes", "url": "https://onemileatatime.com/news/capital-one-venture-x-lounge-access-changes/"}, {"title": "Upgraded Points: Venture X Business loses Priority Pass restaurants", "url": "https://upgradedpoints.com/news/capital-one-venture-x-business-loses-priority-pass-restaurants/"}, {"title": "Chase: Sapphire Lounge network", "url": "https://www.chase.com/sapphire-cards/lounges"}], "unverified": ["Amex Priority Pass guest allowance", "Venue names at some airports"], "verified": "2026-10-25", "scannedAirports": ["ANC", "ATL", "AUS", "BDL", "BNA", "BOS", "CLE", "CLT", "CMH", "CVG", "DCA", "DEN", "DFW", "EWR", "FLL", "GSP", "GUM", "HNL", "IAD", "IAH", "JFK", "LAS", "LAX", "LGA", "MCI", "MCO", "MIA", "MSP", "MSY", "OAK", "ORD", "PBI", "PDX", "PHL", "PHX", "PIT", "PVD", "RDU", "RNO", "SAN", "SAT", "SEA", "SFO", "SJU", "SLC", "SMF", "SNA", "STL", "SYR", "TPA", "TUL", "XNA"], "venuesChecked": "2026-10-26", "guestPolicies": {"csr": {"free": 2, "max": null, "fee": {"adult": 27, "child": 27}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "ritz": {"free": 2, "max": null, "fee": {"adult": 27, "child": 27}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "venturex": {"free": 0, "max": null, "fee": {"adult": 35, "child": 35}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "venturex_biz": {"free": 2, "max": null, "fee": {"adult": 35, "child": 35}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "amex_plat": {"free": 2, "max": null, "fee": {"adult": 35, "child": 35}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "amex_bizplat": {"free": 2, "max": null, "fee": {"adult": 35, "child": 35}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "amex_centurion": {"free": 2, "max": null, "fee": {"adult": 35, "child": 35}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "pp": {"free": 0, "max": null, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "note": "Depends on your Priority Pass plan.", "infantUnder": 2, "infantSure": false}}}, "sapphire": {"arrivals": false, "bringCard": "Your physical Sapphire Reserve card, or the Chase-issued Priority Pass in the Chase app", "cards": ["csr", "ritz"], "connectHoursBefore": 5, "entryHoursBefore": 3, "extraLimits": ["Bring the plastic card, or show the Chase-issued Priority Pass from the Chase app (it can be added to your phone's wallet).", "You also need a boarding pass for a departing flight."], "guests": "2 guests free, then $27 per extra guest.", "name": "Chase Sapphire Lounge", "noAccessHint": "Other Priority Pass members lost access on August 15, 2026.", "notices": [], "operator": "Chase", "otherPriorityPassExcluded": true, "otherPriorityPassNote": "Since August 15, 2026, Priority Pass from other cards or bought directly no longer gets in.", "sources": [{"title": "Chase: Sapphire Lounge network", "url": "https://www.chase.com/sapphire-cards/lounges"}, {"title": "One Mile at a Time: Sapphire Lounges cut Priority Pass access", "url": "https://onemileatatime.com/news/chase-sapphire-lounges-cut-priority-pass-access/"}], "unverified": [], "verified": "2026-10-25", "guestPolicies": {"card": {"free": 2, "max": null, "fee": {"adult": 27, "child": 27}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}}}, "skyclub": {"arrivals": true, "basicEconomyExcluded": true, "entryHoursBefore": 3, "extraLimits": ["No 3-hour limit while you're on a layover.", "One visit covers every club you enter within 24 hours."], "guests": "Up to 2 guests or your immediate family, $50 each.", "guestsEliteplus": "1 guest free on a SkyTeam flight.", "guestsReserve": "Up to 2 guests or immediate family at $50 each; the card includes 4 free guest passes a year.", "name": "Delta Sky Club", "notices": [], "operator": "Delta", "sources": [{"title": "Delta: Sky Club access", "url": "https://www.delta.com/us/en/delta-sky-club/access"}, {"title": "Upgraded Points: Sky Clubs on arrival with Amex Platinum", "url": "https://upgradedpoints.com/news/delta-sky-clubs-on-arrival-amex-platinum/"}, {"title": "The Points Guy: Sky Club restrictions in effect", "url": "https://thepointsguy.com/news/delta-air-lines-sky-club-restrictions-in-effect"}], "unlimitedAfterSpend": "$75k", "unverified": ["Whether arrival access covers international arrivals"], "verified": "2026-10-25", "visitsPlatinum": 10, "visitsReserve": 15, "arrivalNote": "Arriving: open after a Delta flight with a membership or Amex card. With an Amex card it uses one of your yearly visits.", "guestsMedallion": "1 guest free if they're also in Premium Select or Delta One.", "guestPolicies": {"amexCard": {"free": 0, "max": 2, "fee": {"adult": 50, "child": 50}, "childAges": [2, 17], "familyUnder": 21, "familyFree": false, "familyAdults": 1, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "reserveCard": {"free": 0, "max": 2, "fee": {"adult": 50, "child": 50}, "childAges": [2, 17], "familyUnder": 21, "familyFree": false, "familyAdults": 1, "sameFlight": false, "passes": "Your card includes 4 free guest passes a year (up to 2 per visit).", "infantUnder": 2, "infantSure": true}, "member": {"free": 0, "max": 2, "fee": {"adult": 50, "child": 50}, "childAges": [2, 17], "familyUnder": 21, "familyFree": false, "familyAdults": 1, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "ticket": {"free": 0, "max": 0, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "eliteplus": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": true, "infantUnder": 2, "infantSure": true}, "medallion": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": true, "note": "Your guest must also be in Premium Select or Delta One.", "infantUnder": 2, "infantSure": true}}}, "united_club": {"arrivalsPremiumInternational": true, "extraLimits": ["No time limit before departure for members and cardholders.", "Can close to new entries when crowded."], "guestsCard": "1 adult guest plus your children under 18.", "guestsMembership": "No guests on an Individual membership (All Access allows 2).", "guestsPremium": "No guests.", "guestsStarGold": "1 guest, who must be on your same flight.", "name": "United Club", "noAccessHint": "One-time passes ($59) are sold in the United app when space allows (use within 3 hours of departure).", "notices": [], "operator": "United", "sources": [{"title": "The Points Guy: Star Alliance Gold guest rule change", "url": "https://thepointsguy.com/news/star-alliance-gold-lounge-access-cut"}, {"title": "The Points Guy: United Club access changes", "url": "https://thepointsguy.com/news/united-airlines-club-access-changes"}, {"title": "LoungeReview: United Club same-day boarding pass rule (members may use clubs on arrival)", "url": "https://loungereview.com/united-club-updates-upcoming-access-restrictions-for-club-members-and-possible-changes-to-copa-partnership"}, {"title": "LoyaltyLobby: United Club Individual vs All Access", "url": "https://loyaltylobby.com/2025/03/24/united-club-membership-pricing-entry-rule-changes/"}], "starGoldInternationalOnly": true, "unverified": ["Arrival access for members and cardholders (based on United's 2016 clarification)", "Star Alliance Gold from partner airlines on domestic United flights"], "verified": "2026-10-25", "arrivalsForMembers": true, "guestsAllAccess": "Up to 2 adult guests, or 1 adult plus your children under 18 (All Access).", "guestPolicies": {"card": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 18, "familyFree": true, "familyAdults": 1, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "allAccess": {"free": 2, "max": 2, "fee": null, "childAges": [2, 17], "familyUnder": 18, "familyFree": true, "familyAdults": 1, "sameFlight": false, "infantUnder": 2, "infantSure": true}, "membership": {"free": 0, "max": null, "fee": {"adult": 59, "child": 59}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "note": "Individual memberships include no free guests; one-time passes are $59.", "infantUnder": 2, "infantSure": true}, "starGold": {"free": 1, "max": 1, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": true, "infantUnder": 2, "infantSure": true}, "premium": {"free": 0, "max": 0, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": true}}}, "amexpartner": {"name": "Amex partner lounge", "operator": "Amex Global Lounge Collection", "cards": ["amex_plat", "amex_bizplat", "amex_centurion"], "arrivals": false, "bringCard": "Your physical Amex Platinum card", "guests": "Guest rules vary by lounge; check the Amex app.", "noAccessHint": "Part of the Amex Global Lounge Collection (Escape, Plaza Premium and others), included with Amex Platinum.", "extraLimits": ["Usually up to 3 hours before departure.", "Can refuse entry when full."], "notices": [], "verified": "2026-09-30", "unverified": ["Guest rules", "Time limits"], "sources": [{"title": "The Points Party: Amex Global Lounge Collection guide", "url": "https://thepointsparty.com/articles/ultimate-guide-to-american-express-lounge-access"}], "guestPolicies": {"card": {"free": 2, "max": 2, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "note": "Extra guests need a day pass; price varies by lounge.", "infantUnder": 2, "infantSure": false}}}, "starpartner": {"name": "Star Alliance partner lounge", "operator": "Star Alliance", "arrivals": false, "guestsStarGold": "1 guest who is on your same flight.", "guestsAllAccess": "Up to 2 adult guests (the partner lounge's own rules apply).", "noAccessHint": "Star Alliance Gold (including from United Premier Gold) gets you in before any Star Alliance flight, domestic too. United Club All Access does as well.", "extraLimits": ["Departing passengers only.", "Can refuse entry when full."], "notices": [], "verified": "2026-10-25", "unverified": ["All Access partner-lounge access on domestic United itineraries", "Star Alliance Lounge LAX admission on domestic flights"], "sources": [{"title": "Air Canada: Maple Leaf Lounges", "url": "https://aircanada.com/lounges"}, {"title": "One Mile at a Time: Star Alliance lounge access", "url": "https://onemileatatime.com/guides/star-alliance-lounge-access/"}, {"title": "Live and Let's Fly: Free LAX lounge access for United Star Golds", "url": "https://liveandletsfly.com/free-lounge-access-lax-united-star-golds/"}, {"title": "LoyaltyLobby: United Club Individual vs All Access", "url": "https://loyaltylobby.com/2025/03/24/united-club-membership-pricing-entry-rule-changes/"}], "guestPolicies": {"starGold": {"free": 1, "max": null, "fee": {"adult": 59, "child": 59}, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": true, "infantUnder": 2, "infantSure": false}, "allAccess": {"free": 2, "max": 2, "fee": null, "childAges": [2, 17], "familyUnder": 18, "familyFree": true, "familyAdults": 1, "sameFlight": false, "infantUnder": 2, "infantSure": false}, "premium": {"free": 0, "max": 0, "fee": null, "childAges": [2, 17], "familyUnder": 0, "familyFree": false, "familyAdults": 0, "sameFlight": false, "infantUnder": 2, "infantSure": false}}}}, "schema": 1, "guestSources": [{"title": "American Express: Centurion access and guest fees", "url": "https://www.thecenturionlounge.com/info/access/"}, {"title": "The Points Guy: Lounge guest policies by card", "url": "https://thepointsguy.com/guide/credit-card-guest-policies-for-airport-lounges/"}, {"title": "Roaming Cactus: Sapphire Reserve guest policy 2026", "url": "https://roamingcactus.com/credit-cards/csr-lounge-guest-policy-2026"}, {"title": "Delta: Sky Club access", "url": "https://www.delta.com/us/en/delta-sky-club/access"}, {"title": "Chase: Guide to United Club lounges", "url": "https://www.chase.com/personal/credit-cards/education/rewards-benefits/guide-to-united-lounges"}, {"title": "American Airlines: Admirals Club access", "url": "https://www.aa.com/i18n/travel-info/clubs/admirals-club-access.html"}]};
let R = clone(BUILTIN_RULES);
let rulesSource = "built-in";
function applyRemoteRules(d){
  if(!d||d.schema!==1||!d.networks||typeof d.networks!=="object") return false;
  const next=clone(BUILTIN_RULES);
  for(const k in d.networks){ if(d.networks[k]&&typeof d.networks[k]==="object") next.networks[k]=Object.assign({},next.networks[k]||{},d.networks[k]); }
  if(Array.isArray(d.lounges)&&d.lounges.length) next.lounges=d.lounges.filter(l=>l&&typeof l.airport==="string"&&RULES[l.network]);
  if(d.airports&&typeof d.airports==="object") next.airports=Object.assign({},next.airports,d.airports);
  if(d.meta&&typeof d.meta==="object") next.meta=Object.assign({},next.meta,d.meta);
  R=next; rulesSource="live"; return true;
}
const NET = k => R.networks[k]||{};
const safeUrl = u => (typeof u==="string"&&/^https:\/\//.test(u))?u:null;
const arr = v => Array.isArray(v)?v.filter(x=>typeof x==="string"):[];

/* ---------------- Profile (saved only on this device) ---------------- */
const LS_KEY = "loungeFinder.v1";
const EMPTY = {cards:{},mems:{},status:{star:"none",oneworld:"none",skyteam:"none"},spend:{},last:{airport:"",airline:"UA",cabin:"economy",trip:"dom",dir:"depart"},recent:[],statusSource:{star:"home",oneworld:"home",skyteam:"home"},onboarded:false,updatedAt:0};
let profile = clone(EMPTY);
function clone(o){return JSON.parse(JSON.stringify(o))}
function merge(p){const m=clone(EMPTY);if(!p||typeof p!=="object")return m;
  ["cards","mems","spend"].forEach(k=>{if(p[k]&&typeof p[k]==="object")m[k]=Object.assign({},p[k])});
  if(p.status)Object.assign(m.status,p.status); if(p.statusSource&&typeof p.statusSource==="object")Object.assign(m.statusSource,p.statusSource); if(p.last)Object.assign(m.last,p.last);
  if(Array.isArray(p.recent)) m.recent=p.recent.filter(x=>x&&typeof x.airport==="string").slice(0,5);
  const okG=g=>Array.isArray(g)?g.filter(a=>[1,10,19,30].includes(a)).slice(0,8):[];
  m.last.guests=okG(m.last.guests); m.recent.forEach(t=>t.guests=okG(t.guests));
  m.onboarded=!!p.onboarded; m.updatedAt=+p.updatedAt||0; return m;}
try{const raw=localStorage.getItem(LS_KEY); if(raw) profile=merge(JSON.parse(raw));}catch(e){}
function saveProfile(silent){ profile.updatedAt=Date.now(); try{localStorage.setItem(LS_KEY,JSON.stringify(profile))}catch(e){} const s=document.getElementById("saveState"); if(s&&!silent) s.textContent="Saved"; }

/* ---------------- Helpers ---------------- */
function $(s,r){return (r||document).querySelector(s)}
function h(tag,attrs,...kids){const el=document.createElement(tag);
  if(attrs) for(const k in attrs){ if(k==="class") el.className=attrs[k]; else if(k==="html") el.innerHTML=attrs[k]; else if(k.startsWith("on")) el.addEventListener(k.slice(2),attrs[k]); else el.setAttribute(k,attrs[k]); }
  kids.flat().forEach(c=>{ if(c==null||c===false) return; el.appendChild(typeof c==="string"?document.createTextNode(c):c); }); return el;}
const has = id => !!(profile.cards[id]||profile.mems[id]);
const anyOf = ids => ids.filter(has);
const cardName = id => (CARDS.concat(MEMS).find(c=>c[0]===id)||[,id])[1];
const allianceOf = code => (AIRLINES.find(a=>a[0]===code)||[])[2]||"";
const airlineName = code => (AIRLINES.find(a=>a[0]===code)||[,code])[1];

const ICON = {
  card:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/></svg>',
  qr:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v7h-4M14 21v-3"/></svg>',
  pass:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M14 5v14" stroke-dasharray="2 2"/></svg>',
  id:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.8-1.8 2-2.5 3.5-2.5s2.7.7 3.5 2.5M15 10h3M15 14h3"/></svg>',
  app:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/></svg>',
  pin:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
};
const B = {
  pass:t=>({i:"pass",t:t||"Same-day boarding pass"}),
  id:()=>({i:"id",t:"Photo ID"}),
  card:t=>({i:"card",t,key:true}),
  qr:t=>({i:"qr",t,key:true}),
  app:t=>({i:"app",t})
};

/* ---------------- Rules engine (logic in code, every number and sentence from R) ---------------- */
// f = {airport, airline, alliance, cabin, intl, dir}
function premium(f){return f.cabin==="business"||f.cabin==="first"}
function noArrive(f,n){ if(f.dir==="arrive"&&!n.arrivals){ return {status:"no",why:"Not open to arriving passengers",fix:(n.name||"This lounge")+" only admits departing or connecting travelers. Switch to Connect if you have an onward flight today."}; } return null; }
function windowLimit(f,n){
  if(f.dir==="connect"){
    if(n.connectHoursBefore) return "On a connection: enter up to "+n.connectHoursBefore+" hours before your next flight.";
    if(n.connectAnyTime) return "Same-day connection: no time limit.";
    return null;
  }
  return n.entryHoursBefore ? "Entry no earlier than "+n.entryHoursBefore+" hours before departure." : null;
}
function done(n,o){ o.limits=(o.limits||[]).filter(Boolean).concat(arr(n.extraLimits)); return o; }
function ow(){return profile.status.oneworld}
function srcOf(al){ return ((profile.statusSource||{})[al])==="partner"?"partner":"home"; }
function cap(s){return s[0].toUpperCase()+s.slice(1)}

const RULES = {
  centurion(f){
    const n=NET("centurion"); const via=[]; let plat=false;
    arr(n.cards).forEach(c=>{if(has(c)){via.push(cardName(c)); if(c!=="amex_centurion") plat=true;}});
    if(n.deltaReserveWhenFlyingDelta&&has("delta_reserve")&&f.airline==="DL") via.push("Delta Reserve card + flying Delta today");
    if(!via.length) return {status:"no",why:"Needs an Amex Platinum, Business Platinum or Centurion card",fix:has("delta_reserve")?"Your Delta Reserve card works here only when you're flying Delta that day.":n.noAccessHint};
    const a=noArrive(f,n); if(a) return a;
    const guests = has("amex_centurion")&&!plat ? n.guestsCenturionCard : profile.spend.spend_amex ? n.guestsAfterSpend : n.guests;
    return done(n,{gk:has("amex_centurion")?"centurionCard":(plat?"plat":"deltaReserve"),status:"yes",why:"You're in with your "+via[0],
      bring:[B.card(n.bringCard||"Your Amex card"),B.pass("Boarding pass, any airline"),B.id()],
      limits:[windowLimit(f,n), n.arrivals?null:"Departing and connecting travelers only. No arrivals access."],guests});
  },
  capone(f,l,key){
    const n=NET(key||"capone"); const via=anyOf(arr(n.cards));
    if(!via.length) return {status:"no",why:"Needs a Capital One Venture X card",fix:n.noAccessHint};
    const a=noArrive(f,n); if(a) return a;
    return done(n,{gk:"card",status:"yes",why:"You're in with your "+cardName(via[0]),
      bring:[B.card(n.bringCard||"Your Venture X card"),B.pass("Boarding pass for a departing flight"),B.id()],
      limits:[windowLimit(f,n), n.arrivals?null:"Departing flights only. No arrivals access.", n.authorizedUsers],
      guests: profile.spend.spend_capone ? n.guestsAfterSpend : n.guests});
  },
  capone_landing(f,l){return RULES.capone(f,l,"capone_landing")},
  sapphire(f){
    const n=NET("sapphire"); const via=anyOf(arr(n.cards));
    if(!via.length){
      const hasOtherPP=has("pp")||anyOf(["amex_plat","amex_bizplat","venturex","venturex_biz"]).length;
      if(!n.otherPriorityPassExcluded&&hasOtherPP) return {status:"warn",why:"Your Priority Pass membership may get you in",bring:[B.qr("Priority Pass QR code (Priority Pass app)"),B.pass(),B.id()],limits:arr(n.extraLimits),guests:n.guests};
      return {status:"no",why:"Needs a Chase Sapphire Reserve or Ritz-Carlton card",fix:hasOtherPP?n.otherPriorityPassNote:n.noAccessHint};
    }
    const a=noArrive(f,n); if(a) return a;
    return done(n,{gk:"card",status:"yes",why:"You're in with your "+cardName(via[0]),
      bring:[B.qr(n.bringCard||"Your Sapphire Reserve card or Priority Pass QR code"),B.pass(),B.id()],
      limits:[windowLimit(f,n), n.arrivals?null:"Departing and connecting travelers only."],guests:n.guests});
  },
  united_club(f){
    const n=NET("united_club"); const okAir = f.airline==="UA"||f.alliance==="star"; const via=[];
    const allAccess=!!profile.spend.ua_allaccess;
    if(has("united_club_mem")) via.push(["United Club membership",allAccess?(n.guestsAllAccess||n.guestsMembership):n.guestsMembership]);
    if(has("united_club_card")) via.push(["United Club Card",allAccess?(n.guestsAllAccess||n.guestsCard):n.guestsCard]);
    const goldIntlOnly=n.starGoldInternationalOnly&&srcOf("star")==="home";
    if((f.intl||!goldIntlOnly)&&profile.status.star==="gold") via.push(["Star Alliance Gold"+(goldIntlOnly?" on an international trip":""),n.guestsStarGold]);
    if(f.intl&&premium(f)) via.push(["international "+f.cabin+" class ticket",n.guestsPremium]);
    if(!okAir) return {status:"no",why:"You need a United or Star Alliance flight today",fix:"United Clubs require a same-day United or Star Alliance boarding pass."};
    if(!via.length) return {status:"no",why:"No membership, United Club Card, or qualifying status/ticket",fix:n.noAccessHint};
    if(f.dir==="arrive"){
      const memberVia=via.filter(v=>v[0]==="United Club membership"||v[0]==="United Club Card");
      const premVia=(n.arrivalsPremiumInternational&&f.intl&&premium(f))?via.filter(v=>v[0].startsWith("international ")):[];
      const ok=(n.arrivalsForMembers?memberVia:[]).concat(premVia);
      if(!ok.length) return {status:"no",why:"Not open to you on arrival",fix:(n.arrivalsForMembers?"On arrival, United Clubs admit members and United Club cardholders (and international business/first travelers). ":"")+"Star Alliance status only counts on departing or connecting flights."};
      via.splice(0,via.length,...ok);
    }
    const bring=[B.pass("Same-day United or Star Alliance boarding pass"),B.id()];
    if(via[0][0]==="United Club Card") bring.unshift(B.card("Your United Club Card (linked to MileagePlus)"));
    if(via[0][0]==="United Club membership") bring.unshift(B.app("Membership shows in the United app"));
    return done(n,{gk:via[0][0]==="United Club membership"?(allAccess?"allAccess":"membership"):via[0][0]==="United Club Card"?(allAccess?"allAccess":"card"):via[0][0].startsWith("Star")?"starGold":"premium",status:"yes",why:"You're in with your "+via[0][0],bring,limits:[],guests:via[0][1]});
  },
  polaris(f){
    const n=NET("polaris"); const partnerBiz=arr(n.partnerBusinessAirlines);
    const ok = f.intl && ((f.airline==="UA"&&premium(f)) || (f.alliance==="star"&&f.cabin==="first") || (partnerBiz.includes(f.airline)&&f.cabin==="business"));
    if(!ok) return {status:"no",why:"Only for long-haul international business or first",
      fix:(has("united_club_mem")||has("united_club_card")||profile.status.star==="gold")?"United Club memberships, the Club card and Star Gold status don't get you into Polaris lounges.":"Book United Polaris business on a long-haul international flight."};
    if(f.dir==="arrive"&&!n.arrivals) return {status:"no",why:"Not open to arriving passengers",fix:""};
    const firstGuest = f.cabin==="first"&&arr(n.firstClassGuestAirlines).includes(f.airline);
    return done(n,{gk:firstGuest?"firstPartner":"ticket",status:"yes",why:"You're in with your international "+f.cabin+" ticket",
      bring:[B.pass("Same-day long-haul international boarding pass"),B.id()],
      limits:[n.arrivals?"Open to departing, connecting and arriving Polaris travelers on the same itinerary.":null],
      guests: firstGuest ? "1 guest allowed." : "No guests."});
  },
  admirals(f){
    const n=NET("admirals"); const okAir = f.airline==="AA"||f.alliance==="oneworld";
    if(!okAir) return {status:"no",why:"You need an American or oneworld flight today",fix:"Admirals Club access requires a same-day boarding pass on American or a oneworld partner."};
    const via=[]; let cond=false; const s=ow(); const homeStatus=srcOf("oneworld")==="home";
    const intlOnly=n.statusInternationalOnly&&homeStatus;
    if(has("admirals_mem")) via.push(["Admirals Club membership",n.guestsMembership]);
    if(has("citi_exec")) via.push(["Citi AAdvantage Executive card",n.guestsCitiExec]);
    if((f.intl||!intlOnly)&&(s==="sapphire"||s==="emerald")) via.push(["oneworld "+cap(s)+(intlOnly?" on an international flight":""),n.guestsStatus]);
    if(premium(f)&&f.intl) via.push(["international "+f.cabin+" class ticket","No guests."]);
    if(!via.length&&premium(f)){ via.push(["premium cabin, if it's a transcontinental route","No guests."]); cond=true; }
    if(!via.length) return {status:"no",why:"No membership, Citi Executive card, or qualifying ticket",
      fix:(s==="sapphire"||s==="emerald")?"Status from American or Alaska only counts on international flights. Status from another oneworld airline works on any flight.":n.dayPass};
    const bring=[B.pass("Same-day American or oneworld boarding pass"),B.id()];
    if(via[0][0].startsWith("Citi")) bring.unshift(B.card("Your physical Citi AAdvantage Executive card"));
    return done(n,{gk:via[0][0].startsWith("Admirals")?"membership":via[0][0].startsWith("Citi")?"citiExec":via[0][0].startsWith("oneworld")?"status":(f.cabin==="first"&&f.intl?"intlFirst":"premium"),status:cond?"warn":"yes",why:cond?"Maybe: premium cabin counts only on transcon flights (e.g., JFK–LAX/SFO)":"You're in with your "+via[0][0],bring,
      limits:["Members must fly American or a oneworld partner that day."],guests:via[0][1]});
  },
  flagship(f){
    const n=NET("flagship"); const okAir = f.airline==="AA"||f.alliance==="oneworld"; const s=ow();
    const tiers=arr(n.statusTiers).length?arr(n.statusTiers):["emerald"];
    const homeStatus=srcOf("oneworld")==="home";
    const statusOk = okAir && tiers.includes(s) && (f.intl || (!homeStatus && n.partnerStatusAnyFlight));
    let via=null, cond=false, byStatus=false;
    if(okAir&&f.intl&&premium(f)) via="international "+f.cabin+" class ticket";
    else if(statusOk){ via="oneworld "+cap(s)+(homeStatus?" on an international flight":""); byStatus=true; }
    else if(okAir&&premium(f)&&f.airline==="AA"){ via="premium cabin, if it's a transcontinental flight"; cond=true; }
    if(!via) return {status:"no",why:"For international premium cabins and oneworld Sapphire or Emerald",
      fix:(tiers.includes(s)&&homeStatus)?"With status from American or Alaska, Flagship Lounges are open to you on international trips.":(has("admirals_mem")||has("citi_exec"))?"Admirals Club memberships and the Citi card don't include Flagship Lounges.":"Fly international business/first on American or oneworld, or hold oneworld Sapphire or Emerald."};
    if(f.dir==="arrive"&&!(byStatus&&n.statusArrivals)) return {status:"no",why:"Not open to you on arrival",fix:"On arrival, Flagship Lounges admit oneworld Sapphire and Emerald members; premium-cabin tickets count for departures and connections."};
    return done(n,{gk:byStatus?"status":(f.cabin==="first"&&f.intl?"intlFirst":"premium"),status:cond?"warn":"yes",why:cond?"Maybe: only on qualifying transcontinental routes":"You're in with your "+via,
      bring:[B.pass("Same-day qualifying boarding pass"),B.id()],limits:[],
      guests: byStatus ? n.guestsStatus||n.guestsEmerald : (f.cabin==="first"&&f.intl ? (n.guestsIntlFirst||n.guestsPremium) : n.guestsPremium)});
  },
  skyclub(f){
    const n=NET("skyclub"); const deltaish = f.airline==="DL"||f.alliance==="skyteam";
    if(!deltaish) return {status:"no",why:"You need a Delta flight today",fix:"Sky Club entry requires a same-day Delta (or Delta-marketed) boarding pass."};
    if(f.cabin==="basic"&&n.basicEconomyExcluded) return {status:"no",why:"Basic Economy isn't eligible",fix:"Basic Economy fares lose Sky Club access, whatever card or status you hold."};
    let via=null, guests=n.guests, visits=null, cond=false, viaKind="";
    const bring=[B.pass("Delta boarding pass for today"+(n.basicEconomyExcluded?" (not Basic Economy)":"")),B.id()];
    const amex=anyOf(["amex_plat","amex_bizplat","amex_centurion"]);
    const st=profile.status.skyteam, homeStatus=srcOf("skyteam")==="home";
    if(has("skyclub_mem")){ via="Sky Club membership"; viaKind="member"; bring.unshift(B.app("Membership shows in the Fly Delta app")); }
    else if(f.intl&&premium(f)){ via="Delta One / international business ticket"; guests="No guests."; viaKind="ticket"; }
    else if(f.intl&&st==="eliteplus"&&!homeStatus){ via="SkyTeam Elite Plus on an international flight"; guests=n.guestsEliteplus; viaKind="status"; }
    else if(f.intl&&st==="eliteplus"&&homeStatus&&f.cabin==="premium"){ via="Medallion status in Premium Select on an international flight"; guests=n.guestsMedallion||n.guestsEliteplus; viaKind="status"; }
    else if(f.airline==="DL"&&has("delta_reserve")){ via="Delta Reserve card"; visits=n.visitsReserve; guests=n.guestsReserve; viaKind="card"; bring.unshift(B.card("Your physical Delta Reserve card")); }
    else if(f.airline==="DL"&&amex.length){ via=cardName(amex[0]); visits=n.visitsPlatinum; viaKind="card"; bring.unshift(B.card("Your physical Amex card")); }
    else if(!f.intl&&premium(f)&&f.airline==="DL"){ via="Delta One ticket, if your flight is sold as Delta One"; guests="No guests."; viaKind="ticket"; cond=true; }
    if(!via){
      const medallionNote = f.intl&&st==="eliteplus"&&homeStatus ? "Delta Medallions get Sky Club access on international trips only in Premium Select or Delta One. Elite Plus from another SkyTeam airline works in any cabin." : null;
      return {status:"no",why:"No Sky Club membership, eligible Amex card, or qualifying status",
        fix:medallionNote||(f.airline!=="DL"&&anyOf(["amex_plat","amex_bizplat","delta_reserve"]).length?"Amex cards only work when you're on a Delta-marketed flight.":"Amex Platinum and Delta Reserve cardholders get in when flying Delta.")};
    }
    if(f.dir==="arrive"&&!(n.arrivals&&(viaKind==="member"||viaKind==="card"))) return {status:"no",why:"Not open to you on arrival",fix:"On arrival, Sky Clubs admit members and Amex Platinum / Delta Reserve cardholders who just flew Delta."};
    const limits=[ f.dir==="arrive" ? (n.arrivalNote||null) : f.dir==="connect" ? "Connecting: stay for your whole layover." : (n.entryHoursBefore?"Entry no earlier than "+n.entryHoursBefore+" hours before departure.":null),
      (n.arrivals||f.dir==="arrive")?null:"No access on arrival."];
    if(visits) limits.unshift(profile.spend.spend_amex ? "Unlimited visits (you've hit the spend threshold)." : "Uses 1 of your "+visits+" visits per year (Feb 1–Jan 31). Each visit covers 24 hours. Unlimited after "+(n.unlimitedAfterSpend||"$75k")+" annual spend.");
    return done(n,{gk:viaKind==="member"?"member":viaKind==="ticket"?"ticket":viaKind==="status"?(homeStatus?"medallion":"eliteplus"):(via==="Delta Reserve card"?"reserveCard":"amexCard"),status:(cond||(visits&&!profile.spend.spend_amex))?"warn":"yes",why:"You're in with your "+via,bring,limits,guests});
  },
  deltaone(f){
    const n=NET("deltaone"); const ok = f.intl && premium(f) && (f.airline==="DL"||f.alliance==="skyteam");
    if(!ok) return {status:"no",why:"Only for Delta One (and partner long-haul business) passengers",
      fix:(has("skyclub_mem")||anyOf(["amex_plat","delta_reserve"]).length)?"Sky Club memberships and Amex cards don't work at Delta One Lounges.":"Book Delta One on a long-haul flight."};
    const a=noArrive(f,n); if(a) return a;
    return done(n,{gk:"ticket",status:"yes",why:"You're in with your "+f.cabin+" ticket",bring:[B.pass("Same-day Delta One boarding pass"),B.id()],
      limits:[n.arrivals?"Open to departing, connecting and arriving Delta One travelers.":null],guests:"No guests."});
  },
  alaska(f){
    const n=NET("alaska"); const okAir = f.airline==="AS"||f.alliance==="oneworld";
    if(!okAir) return {status:"no",why:"You need an Alaska or oneworld flight today",fix:"Alaska Lounges require a same-day Alaska or oneworld boarding pass."};
    const s=ow(); let via=null, guests=n.guestsMembership;
    if(has("alaska_mem")) via="Alaska Lounge membership";
    else if(f.intl&&(s==="sapphire"||s==="emerald")){ via="oneworld "+cap(s)+" on an international flight"; guests=n.guestsStatus; }
    else if(f.intl&&premium(f)){ via="international "+f.cabin+" class ticket"; guests="No guests."; }
    if(!via) return {status:"no",why:"No membership or qualifying oneworld status/ticket",fix:n.noAccessHint};
    return done(n,{gk:via.includes("membership")?"membership":via.startsWith("oneworld")?"status":"premium",status:"yes",why:"You're in with your "+via,
      bring:[B.pass("Same-day Alaska or oneworld boarding pass"),B.id()].concat(via.includes("membership")?[B.app("Membership shows in the Alaska app")]:[]),limits:[],guests});
  }
};

function ppSources(){ return anyOf(arr(NET("prioritypass").cards)); }
function ppScanned(code){ return arr(NET("prioritypass").scannedAirports).includes(code); }
RULES.prioritypass=function(f,l){
  const n=NET("prioritypass"); const src=ppSources();
  if(!src.length) return {status:"no",why:"Needs a Priority Pass membership",fix:"Priority Pass comes with Sapphire Reserve, Venture X and Amex Platinum (enroll first), or can be bought directly."};
  const a=noArrive(f,n); if(a) return a;
  const g=(n.guestsByCard||{})[src[0]];
  return done(n,{gk:src[0],status:"yes",why:"You're in with Priority Pass from your "+cardName(src[0]),
    bring:[B.qr("Priority Pass QR code in the Priority Pass app (or Apple Wallet)"),B.pass(),B.id()],
    limits:[l&&l.note?l.note:null],guests:g?"With your "+cardName(src[0])+": "+g:""});
};
RULES.starpartner=function(f,l){
  const n=NET("starpartner"); const okAir=f.alliance==="star";
  if(!okAir) return {status:"no",why:"You need a United or Star Alliance flight today",fix:"Star Alliance partner lounges need a same-day Star Alliance boarding pass."};
  const allAccess=!!profile.spend.ua_allaccess&&(has("united_club_card")||has("united_club_mem"));
  let via=null, guests="";
  if(profile.status.star==="gold"){ via="Star Alliance Gold"; guests=allAccess?"Up to 2 guests using your All Access membership (or 1 on your flight with Star Gold).":n.guestsStarGold; }
  else if(allAccess){ via="United Club All Access membership"; guests=n.guestsAllAccess; }
  else if(f.intl&&premium(f)){ via="international "+f.cabin+" class ticket"; guests="No guests."; }
  if(!via) return {status:"no",why:"Needs Star Alliance Gold, United Club All Access, or an international business/first ticket",fix:n.noAccessHint};
  const a=noArrive(f,n); if(a) return a;
  const bring=[B.pass("Same-day United or Star Alliance boarding pass"),B.id()];
  if(via.startsWith("Star Alliance Gold")) bring.unshift(B.app("Star Alliance Gold shown in the United app (or your card)"));
  if(via.startsWith("United Club All")) bring.unshift(B.app("Your United Club membership in the United app"));
  return done(n,{gk:allAccess?"allAccess":via.startsWith("Star")?"starGold":"premium",status:"yes",why:"You're in with your "+via,bring,limits:[l&&l.note?l.note:null],guests});
};
RULES.amexpartner=function(f){
  const n=NET("amexpartner"); const via=anyOf(arr(n.cards));
  if(!via.length) return {status:"no",why:"Needs an Amex Platinum or Business Platinum card",fix:n.noAccessHint};
  const a=noArrive(f,n); if(a) return a;
  return done(n,{gk:"card",status:"yes",why:"You're in with your "+cardName(via[0]),bring:[B.card(n.bringCard||"Your Amex card"),B.pass(),B.id()],limits:[],guests:n.guests});
};
// Only used at airports we haven't scanned for Priority Pass venues.
function priorityPass(f){
  const n=NET("prioritypass"); const sources=ppSources();
  if(!sources.length||ppScanned(f.airport)) return null;
  return {key:"prioritypass",network:"Priority Pass",name:"Priority Pass (not checked here)",loc:"We haven't checked "+f.airport+" for Priority Pass lounges yet",
    status:"warn",why:"Your "+cardName(sources[0])+" includes Priority Pass. Check the Priority Pass app for a lounge at "+f.airport+".",
    bring:[B.qr("Priority Pass QR code in the Priority Pass app"),B.pass(),B.id()],limits:arr(n.extraLimits),guests:"",link:"https://www.prioritypass.com"};
}
function allianceLounge(f){
  if(!f.intl||!f.alliance) return null;
  const st=profile.status; let via=null, statusVia=false;
  if(f.alliance==="star"&&st.star==="gold"){via="Star Alliance Gold";statusVia=true;}
  if(f.alliance==="oneworld"&&(st.oneworld==="sapphire"||st.oneworld==="emerald")){via="oneworld "+cap(st.oneworld);statusVia=true;}
  if(f.alliance==="skyteam"&&st.skyteam==="eliteplus"){via="SkyTeam Elite Plus";statusVia=true;}
  if(!via&&premium(f)) via=cap(f.cabin)+" class on "+airlineName(f.airline);
  if(!via) return null;
  return {key:null,network:ALLIANCE_NAME[f.alliance],name:airlineName(f.airline)+" or partner lounge",loc:"Your airline's app shows which lounge to use at "+f.airport,
    status:"warn",why:"You qualify with "+via+" on an international flight",
    bring:[B.pass("Same-day international "+ALLIANCE_NAME[f.alliance]+" boarding pass"),B.id()],
    limits:["Applies at your departure airport; arrival lounges vary by airline.","Domestic-only trips usually don't qualify with status."],
    guests: statusVia ? "Usually 1 guest flying the same alliance." : "Usually no guests."};
}

function evaluate(f){
  const out=[];
  R.lounges.filter(l=>l.airport===f.airport&&RULES[l.network]).forEach(l=>{
    const n=NET(l.network); const res=RULES[l.network](f,l);
    out.push(Object.assign({key:l.network,network:n.operator||"",name:l.name||n.name||l.network,loc:l.location||"",loungeStatus:l.status||"open",loungeNote:l.note||""},res));
  });
  const pp=priorityPass(f); if(pp) out.push(pp);
  const al=allianceLounge(f); if(al) out.push(al);
  // The same room can be reachable two ways (e.g. Escape Lounge via Amex and via Priority Pass): show it once, best access first.
  const rank={yes:0,warn:1,no:2}, seen={};
  out.sort((a,b)=>rank[a.status]-rank[b.status]);
  const dedup=[]; out.forEach(o=>{ const k=String(o.name).toLowerCase().replace(/lounges?$/,"").trim()+"|"+String(o.loc).toLowerCase().slice(0,12); if(seen[k]) { if(o.status!=="no"&&seen[k].alt==null) seen[k].alt=o.key==="prioritypass"?"Priority Pass":(o.network||"another route"); return; } seen[k]=o; dedup.push(o); });
  out.length=0; dedup.forEach(o=>{ if(o.alt) o.why+=". Also open to you through "+o.alt+"."; out.push(o); });
  out.forEach(o=>{
    if((o.loungeStatus==="closed"||o.loungeStatus==="opening")&&o.status!=="no"){
      o.status="warn"; o.limits=[o.loungeNote||(o.loungeStatus==="closed"?"Temporarily closed. Check before you go.":"Not open yet.")].concat(o.limits||[]);
    }
  });
  return out;
}

/* ---------------- Colors ---------------- */
const NET_COLOR = {centurion:"amex",capone:"capone",capone_landing:"capone",sapphire:"chase",united_club:"united",polaris:"united",admirals:"aa",flagship:"aa",skyclub:"delta",deltaone:"delta",alaska:"alaska",prioritypass:"pp",amexpartner:"amex",starpartner:"united"};
const ITEM_COLOR = {amex_plat:"amex",amex_bizplat:"amex",amex_centurion:"amex",delta_reserve:"delta",venturex:"capone",venturex_biz:"capone",csr:"chase",ritz:"chase",united_club_card:"united",citi_exec:"aa",pp:"pp",united_club_mem:"united",admirals_mem:"aa",skyclub_mem:"delta",alaska_mem:"alaska"};
const STATUS_COLOR = {star:"united",oneworld:"aa",skyteam:"delta"};
const SHORT = {amex_plat:"Amex Platinum",amex_bizplat:"Amex Business Platinum",amex_centurion:"Amex Centurion",delta_reserve:"Delta Reserve",venturex:"Venture X",venturex_biz:"Venture X Business",csr:"Sapphire Reserve",ritz:"Ritz-Carlton Card",united_club_card:"United Club Card",citi_exec:"Citi AAdvantage Executive",pp:"Priority Pass",united_club_mem:"United Club",admirals_mem:"Admirals Club",skyclub_mem:"Sky Club",alaska_mem:"Alaska Lounge"};

/* ---------------- Views ---------------- */
let view="home", prevView="home";
function go(v){
  if(v==="profile"&&view!=="profile") prevView=view;
  view=v;
  ["setup","home","results","profile"].forEach(k=>{$("#v-"+k).hidden=k!==v;});
  if(v==="home") renderHome();
  if(v==="profile") renderProfileEditor();
  if(v==="results") runSearch();
  window.scrollTo(0,0);
}
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]"); if(g) go(g.getAttribute("data-go"));});
let tt=null; function toast(t){const el=$("#toast"); el.textContent=t; el.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>el.classList.remove("show"),1300);}

/* ---------------- Reusable pickers ---------------- */
function tile(id,title,desc,bucket,onChange){
  const b=h("button",{type:"button",class:"tile c-"+(ITEM_COLOR[id]||"ally"),"aria-pressed":String(!!profile[bucket][id])},
    h("span",{class:"sw"}),h("b",null,title),h("span",null,desc),h("span",{class:"tick",html:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>'}));
  b.addEventListener("click",()=>{ profile[bucket][id]=!profile[bucket][id]; b.setAttribute("aria-pressed",String(!!profile[bucket][id])); saveProfile(); if(onChange) onChange(); });
  return b;
}
const STATUS_SOURCE = {star:[["home","United"],["partner","Other Star airline"]],oneworld:[["home","American / Alaska"],["partner","Other oneworld"]],skyteam:[["home","Delta"],["partner","Other SkyTeam"]]};
function statusRow(k,label,opts,hint){
  const s=h("div",{class:"seg",role:"group","aria-label":label});
  const srcWrap=h("div",{class:"srcq"});
  const drawSrc=()=>{ srcWrap.innerHTML=""; if(profile.status[k]==="none") return;
    if(!profile.statusSource) profile.statusSource={};
    const cur=profile.statusSource[k]||"home";
    const ss=h("div",{class:"seg",role:"group","aria-label":"Status comes from"});
    STATUS_SOURCE[k].forEach(([v,l])=>ss.appendChild(h("button",{type:"button","aria-pressed":String(cur===v),onclick:()=>{profile.statusSource[k]=v; saveProfile(); drawSrc();}},l)));
    srcWrap.appendChild(h("small",{class:"srcl"},"Which airline gives you this status? It changes where it works."));
    srcWrap.appendChild(ss); };
  const draw=()=>{ s.innerHTML=""; opts.forEach(([v,l])=>s.appendChild(h("button",{type:"button","aria-pressed":String(profile.status[k]===v),onclick:()=>{profile.status[k]=v; saveProfile(); draw(); drawSrc();}},l))); };
  draw(); drawSrc();
  return h("div",{class:"statusrow c-"+STATUS_COLOR[k]},h("div",{class:"hd"},h("i"),label),s,h("small",null,hint),srcWrap);
}
const CARD_TILES = () => CARDS.map(c=>tile(c[0],SHORT[c[0]]||c[1],c[2],"cards"));
const MEM_TILES = () => MEMS.map(c=>tile(c[0],c[1].replace(" (from another source)",""),c[2],"mems"));
const STATUS_ROWS = () => STATUS.map(s=>statusRow(...s));
const SPEND_ALL = SPEND.concat([["ua_allaccess","United Club All Access","$50k+ on your United Club card, or Premier Gold and up: 2 guests and Star Alliance partner lounges"]]);
const SPEND_NEEDS = {spend_amex:["amex_plat","amex_bizplat"],spend_capone:["venturex","venturex_biz"],ua_allaccess:["united_club_card","united_club_mem"]};
const SPEND_COLOR = {spend_amex:"c-amex",spend_capone:"c-capone",ua_allaccess:"c-united"};
function spendApplies(){ return SPEND_ALL.some(s=>anyOf(SPEND_NEEDS[s[0]]).length); }
const SPEND_TILES = () => SPEND_ALL.filter(s=>anyOf(SPEND_NEEDS[s[0]]).length).map(s=>{const t=tile(s[0],s[1],s[2],"spend"); t.classList.remove("c-ally"); t.classList.add(SPEND_COLOR[s[0]]); return t;});

/* ---------------- Setup wizard ---------------- */
const STEPS = [
  {title:"Which travel credit cards do you have?",sub:"Pick every card where you're the main cardholder. These unlock most lounges.",body:()=>h("div",{class:"tiles"},CARD_TILES())},
  {title:"Any lounge memberships?",sub:"Paid memberships, or ones that came with your airline status.",body:()=>h("div",{class:"tiles"},MEM_TILES())},
  {title:"What's your airline status?",sub:"Choose the alliance level your status gives you. Leave it at None if you don't have any.",body:()=>h("div",null,STATUS_ROWS())},
  {title:"Unlocked any upgrades?",sub:"Big spending or status unlocks extra guests, visits and lounges on some cards.",body:()=>h("div",{class:"tiles"},SPEND_TILES()),when:spendApplies}
];
let step=0;
function activeSteps(){return STEPS.filter(s=>!s.when||s.when());}
function renderWizard(){
  const steps=activeSteps(); if(step>=steps.length) step=steps.length-1;
  const s=steps[step];
  $("#wzCount").textContent="Step "+(step+1)+" of "+steps.length;
  const pr=$("#wzProgress"); pr.innerHTML=""; steps.forEach((_,i)=>pr.appendChild(h("i",{class:i<=step?"on":""})));
  const body=$("#wzBody"); body.innerHTML="";
  if(step===0) body.appendChild(h("div",{class:"eyebrow",style:"margin-bottom:8px;color:var(--brand)"},"Let's build your lounge profile"));
  body.appendChild(h("h1",{class:"wz-title"},s.title)); body.appendChild(h("p",{class:"wz-sub"},s.sub)); body.appendChild(s.body());
  $("#wzBack").hidden=step===0;
  $("#wzNext").textContent=step===steps.length-1?"Finish":"Next";
  $("#wzSkip").hidden=step===steps.length-1;
}
function wizardNext(){ const steps=activeSteps(); if(step<steps.length-1){step++; renderWizard(); window.scrollTo(0,0);} else { profile.onboarded=true; saveProfile(true); go("home"); toast("Profile saved"); } }
$("#wzNext").addEventListener("click",wizardNext);
$("#wzSkip").addEventListener("click",wizardNext);
$("#wzBack").addEventListener("click",()=>{ if(step>0){step--; renderWizard(); window.scrollTo(0,0);} });

/* ---------------- Profile editor ---------------- */
function renderProfileEditor(){
  const b=$("#peBody"); b.innerHTML="";
  const sec=(t,p,el)=>h("section",{class:"pe-sec"},h("h2",null,t),h("p",null,p),el);
  b.appendChild(sec("Credit cards","Where you're the main cardholder.",h("div",{class:"tiles"},CARD_TILES().map(t=>{t.addEventListener("click",renderSpendSec);return t;}))));
  b.appendChild(sec("Lounge memberships","Paid, or included with your status.",h("div",{class:"tiles"},MEM_TILES())));
  b.appendChild(sec("Airline status","The alliance level your status gives you.",h("div",null,STATUS_ROWS())));
  const sp=h("div",{id:"spendSec"}); b.appendChild(sp); renderSpendSec();
  $("#saveState").textContent=profile.updatedAt?"Saved":"";
}
function renderSpendSec(){ const sp=$("#spendSec"); if(!sp) return; sp.innerHTML=""; if(spendApplies()) sp.appendChild(h("section",{class:"pe-sec"},h("h2",null,"Unlocked upgrades"),h("p",null,"Spending thresholds or status that unlock extra guests, visits and lounges."),h("div",{class:"tiles"},SPEND_TILES()))); }
$("#profileBack").addEventListener("click",()=>go(prevView==="results"?"results":"home"));
$("#profileDone").addEventListener("click",()=>{ toast("Saved"); go(prevView==="results"?"results":"home"); });

/* ---------------- Home ---------------- */
function renderHome(){
  const p=$("#passes"); p.innerHTML="";
  const items=[];
  CARDS.concat(MEMS).forEach(c=>{ if(has(c[0])) items.push([ITEM_COLOR[c[0]],SHORT[c[0]]||c[1]]); });
  if(profile.spend.ua_allaccess&&anyOf(["united_club_card","united_club_mem"]).length) items.push(["united","United Club All Access"]);
  STATUS.forEach(([k,label,opts])=>{ const v=profile.status[k]; if(v&&v!=="none") items.push([STATUS_COLOR[k],label+" "+(opts.find(o=>o[0]===v)||[,v])[1]+((profile.statusSource||{})[k]==="partner"?" (partner airline)":"")]); });
  if(!items.length) p.appendChild(h("div",{class:"emptynote"},"No cards or status yet. Tap Edit to add them so results match you."));
  items.forEach(([c,t])=>p.appendChild(h("span",{class:"passchip c-"+(c||"ally")},h("i"),t)));
  const rs=$("#recentSect"), rl=$("#recent"); rl.innerHTML="";
  const rec=(profile.recent||[]).slice(0,3);
  rs.hidden=!rec.length;
  rec.forEach(t=>rl.appendChild(h("button",{type:"button",onclick:()=>{Object.assign(profile.last,t); saveProfile(true); go("results");}},
    h("span",{class:"code"},t.airport),
    h("span",{class:"meta"},h("b",null,(R.airports[t.airport]||t.airport)),airlineName(t.airline)+" · "+cabinLabel(t.cabin)+" · "+dirLabel(t.dir)+((t.guests&&t.guests.length)?" · +"+partyText(t.guests):"")),
    h("span",{html:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'}))));
  renderFresh();
}
$("#openTrip").addEventListener("click",()=>openSheet());

/* ---------------- Trip sheet ---------------- */
const CABINS=[["basic","Basic Econ"],["economy","Economy"],["premium","Premium"],["business","Business"],["first","First"]];
const TRIPS=[["dom","Domestic"],["intl","International"]];
const DIRS=[["depart","Departing"],["connect","Connecting"],["arrive","Arriving"]];
const cabinLabel=v=>(CABINS.find(c=>c[0]===v)||[,v])[1];
const dirLabel=v=>(DIRS.find(c=>c[0]===v)||[,v])[1];
let draft={};
function seg(el,opts,key){
  el.innerHTML="";
  opts.forEach(([v,l])=>el.appendChild(h("button",{type:"button","aria-pressed":String(draft[key]===v),onclick:()=>{draft[key]=v; seg(el,opts,key);}},l)));
}
function showApName(){const c=($("#airport").value||"").toUpperCase(); $("#apname").textContent=R.airports[c]||(c.length===3?"Card and status lounges still apply":"");}
function drawGuests(){
  const box=$("#guestList"); box.innerHTML="";
  (draft.guests||[]).forEach((a,i)=>{
    const sg=h("div",{class:"seg",role:"group","aria-label":"Guest "+(i+1)+" age"});
    AGE_GROUPS.forEach(([v,l])=>sg.appendChild(h("button",{type:"button","aria-pressed":String(a===v),onclick:()=>{draft.guests[i]=v; drawGuests();}},l)));
    box.appendChild(h("div",{class:"grow"},h("span",{class:"gnum"},"Guest "+(i+1)),sg,
      h("button",{type:"button",class:"gdel","aria-label":"Remove guest "+(i+1),onclick:()=>{draft.guests.splice(i,1); drawGuests();},html:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'})));
  });
  $("#addGuest").textContent=(draft.guests&&draft.guests.length)?"+ Add another guest":"+ Add a guest";
}
$("#addGuest").addEventListener("click",()=>{ draft.guests=(draft.guests||[]).concat([30]); drawGuests(); });
function openSheet(){
  draft=Object.assign({},profile.last); draft.guests=(profile.last.guests||[]).slice(); drawGuests();
  $("#airport").value=draft.airport||""; $("#airline").value=draft.airline||"UA";
  seg($("#cabin"),CABINS,"cabin"); seg($("#trip"),TRIPS,"trip"); seg($("#dir"),DIRS,"dir"); showApName();
  const sc=$("#scrim"), sh=$("#sheet"); sc.hidden=false; sh.hidden=false;
  requestAnimationFrame(()=>{sc.classList.add("show"); sh.classList.add("show");});
}
function closeSheet(){
  const sc=$("#scrim"), sh=$("#sheet"); sc.classList.remove("show"); sh.classList.remove("show");
  setTimeout(()=>{sc.hidden=true; sh.hidden=true;},280);
}
$("#closeSheet").addEventListener("click",closeSheet);
$("#scrim").addEventListener("click",closeSheet);
$("#editTrip").addEventListener("click",()=>openSheet());
$("#airport").addEventListener("input",e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z]/g,""); showApName();});
$("#tripForm").addEventListener("submit",e=>{
  e.preventDefault();
  const code=($("#airport").value||"").toUpperCase();
  if(code.length!==3){ toast("Enter a 3-letter airport code"); $("#airport").focus(); return; }
  draft.airport=code; draft.airline=$("#airline").value;
  profile.last=Object.assign({},draft);
  const key=t=>[t.airport,t.airline,t.cabin,t.trip,t.dir,(t.guests||[]).join(",")].join("|");
  profile.recent=[Object.assign({},draft)].concat((profile.recent||[]).filter(t=>key(t)!==key(draft))).slice(0,5);
  saveProfile(true); $("#airport").blur(); closeSheet(); go("results");
});


/* ---------------- Guests ---------------- */
const AGE_GROUPS=[[1,"Under 2"],[10,"2–17"],[19,"18–20"],[30,"21+"]];
const ageLabel=a=>(AGE_GROUPS.find(g=>g[0]===a)||[,"Adult"])[1];
function partyText(g){ if(!g||!g.length) return ""; const c={}; g.forEach(a=>c[a]=(c[a]||0)+1);
  const nm={1:["infant","infants"],10:["child","children"],19:["guest 18–20","guests 18–20"],30:["adult","adults"]};
  return Object.keys(c).sort((x,y)=>y-x).map(a=>c[a]+" "+nm[a][c[a]>1?1:0]).join(", "); }
function feeFor(gp,a){ if(!gp.fee) return null; const ca=gp.childAges||[2,17]; return (a>=ca[0]&&a<=ca[1])?gp.fee.child:gp.fee.adult; }
const plural=(n,a,b)=>n+" "+(n===1?a:b);
function guestVerdict(o,party){
  if(!party||!party.length||o.status==="no") return null;
  const n=o.key?NET(o.key):{}; const gp=o.gk!=null?((n.guestPolicies||{})[o.gk]):null;
  if(!gp) return {cls:"warn",head:"Guest rules vary here",lines:["Ask at the front desk about your group."]};
  let free=gp.free||0; if(gp.freeAfterSpend&&profile.spend[gp.spendKey]) free=Math.max(free,gp.freeAfterSpend);
  const lines=[]; let cost=0, over=false, unsure=false;
  const iu=gp.infantUnder||0;
  const infants=party.filter(a=>a<iu);
  let rest=party.filter(a=>a>=iu).sort((a,b)=>b-a);
  if(infants.length){ lines.push(plural(infants.length,"infant","infants")+": free"+(gp.infantSure?", and doesn't count as a guest.":" (usually; confirm at the desk).")); if(!gp.infantSure) unsure=true; }
  if(gp.familyUnder&&rest.length){
    const kids=rest.filter(a=>a<gp.familyUnder), adults=rest.filter(a=>a>=gp.familyUnder);
    if(kids.length&&adults.length<=(gp.familyAdults||0)){
      const who=(adults.length?"your partner and ":"your ")+plural(kids.length,"child","children");
      if(gp.familyFree){ lines.push(who[0].toUpperCase()+who.slice(1)+": free as immediate family."); rest=[]; }
      else { let c=0; rest.forEach(a=>{c+=feeFor(gp,a)||0;}); cost+=c; lines.push("Immediate family can all come in: "+plural(rest.length,"person","people")+" at $"+(gp.fee?gp.fee.adult:0)+" each = $"+c+"."); rest=[]; }
    }
  }
  if(rest.length){
    if(gp.max===0){ over=true; lines.push(plural(rest.length,"guest","guests")+" can't come in as your guest: this ticket allows none"+(iu?" (infants under "+iu+" excepted)":"")+". Anyone with their own qualifying ticket gets in on it."); }
    else {
      const allowed=gp.max==null?rest.length:Math.min(gp.max,rest.length);
      const freeN=Math.min(free,allowed), paid=rest.slice(freeN,allowed), left=rest.length-allowed;
      if(freeN) lines.push(plural(freeN,"guest","guests")+": free.");
      if(paid.length){
        if(!gp.fee){ over=true; lines.push(plural(paid.length,"more guest","more guests")+": not covered."); }
        else { const fees=paid.map(a=>feeFor(gp,a)); const sum=fees.reduce((x,y)=>x+y,0); cost+=sum;
          lines.push(plural(paid.length,"guest","guests")+" at "+[...new Set(fees)].map(v=>"$"+v).join("/")+" = $"+sum+"."); }
      }
      if(left>0){ over=true; lines.push("Limit is "+plural(gp.max,"guest","guests")+" per visit, so "+plural(left,"person","people")+" can't come in."); }
    }
  }
  if(gp.sameFlight) lines.push("Guests must be on your same flight.");
  if(gp.passes) lines.push(gp.passes);
  if(gp.note) lines.push(gp.note);
  const cls=over?"no":(cost>0||unsure)?"warn":"ok";
  const head=over?"Not everyone in your group can come in":cost>0?"Your group: $"+cost+" in guest fees":unsure?"Your group should get in free":"Your group gets in free";
  return {cls,head,lines};
}

/* ---------------- Results ---------------- */
function chip(b,c){const el=h("span",{class:"chip"+(b.key?" key":"")}); el.innerHTML=ICON[b.i]; el.appendChild(document.createTextNode(b.t)); return el;}
function card(o){
  const cls=o.status==="yes"?"ok":o.status==="warn"?"warn":"no";
  const color=o.key?NET_COLOR[o.key]:"ally";
  const pillTxt=cls==="ok"?"✓ You're in":cls==="warn"?"Check details":"Not eligible";
  const bodyId="b"+Math.random().toString(36).slice(2,8);
  const loc=h("div",{class:"lc-loc"}); loc.innerHTML=ICON.pin; loc.appendChild(document.createTextNode(o.loc||"Location: see the "+(o.network||"airline")+" app"));
  const name=h("div",{class:"lc-name"},o.name, o.loungeStatus==="closed"?h("span",{class:"tag"},"Temp. closed"):o.loungeStatus==="opening"?h("span",{class:"tag"},"Opening soon"):null);
  const head=h("button",{type:"button",class:"lc-head","aria-expanded":"false","aria-controls":bodyId},
    h("div",{class:"lc-main"},h("div",{class:"lc-net"},o.network||""),name,loc,h("div",{class:"lc-why"},o.why)),
    h("span",{class:"pill "+cls},pillTxt),
    h("span",{class:"chev",html:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'}));
  const gv=guestVerdict(o,profile.last.guests||[]);
  if(gv) head.querySelector(".lc-main").appendChild(h("div",{class:"lc-guest gv-"+gv.cls},gv.head));
  const body=h("div",{class:"lc-body",id:bodyId,hidden:""});
  if(gv) body.appendChild(h("div",{class:"gbox gv-"+gv.cls},h("b",null,"Your group ("+partyText(profile.last.guests)+")"),gv.lines.map(t=>h("div",null,t))));
  const n=o.key?NET(o.key):null;
  if(o.status==="no"){
    if(o.fix) body.appendChild(h("div",{class:"guests"},h("b",null,"What would get you in: "),o.fix));
  } else {
    const notes=n?arr(n.notices):[];
    if(notes.length) body.appendChild(h("div",{class:"notice"},h("b",null,"Rule change"),notes.map(t=>h("div",null,t))));
    if(o.bring&&o.bring.length){ body.appendChild(h("div",{class:"lbl"},"What to bring")); body.appendChild(h("div",{class:"chips"},o.bring.map(b=>chip(b)))); }
    if(o.limits&&o.limits.length){ body.appendChild(h("div",{class:"lbl"},"Limits")); body.appendChild(h("ul",{class:"limits"},o.limits.map(l=>h("li",null,l)))); }
    if(o.guests&&!gv){ body.appendChild(h("div",{class:"guests"},h("b",null,"Guests: "),o.guests)); }
    if(o.link) body.appendChild(h("a",{href:o.link,target:"_blank",rel:"noopener"},"Find Priority Pass venues ↗"));
  }
  if(n){
    const src=(Array.isArray(n.sources)?n.sources:[]).filter(s=>s&&safeUrl(s.url));
    const meta=h("div",{class:"prov"},(n.verified?"Rules checked "+fmtDate(n.verified):"Not yet checked")+(arr(n.unverified).length?" · some details unconfirmed":""));
    src.slice(0,4).forEach((s,i)=>{ meta.appendChild(document.createTextNode(i?" · ":" · Sources: ")); meta.appendChild(h("a",{href:safeUrl(s.url),target:"_blank",rel:"noopener"},String(s.title||"Source").split(":")[0])); });
    body.appendChild(meta);
  }
  head.addEventListener("click",()=>{ const open=head.getAttribute("aria-expanded")==="true"; head.setAttribute("aria-expanded",String(!open)); body.hidden=open; });
  return h("article",{class:"lc "+cls+" c-"+color},head,body);
}
function runSearch(){
  const t=profile.last; const code=(t.airport||"").toUpperCase();
  $("#rCode").textContent=code;
  const m=$("#rMeta"); m.innerHTML=""; m.appendChild(h("b",null,airlineName(t.airline))); m.appendChild(document.createTextNode(cabinLabel(t.cabin)+" · "+(t.trip==="intl"?"International":"Domestic")+" · "+dirLabel(t.dir)+((t.guests&&t.guests.length)?" · with "+partyText(t.guests):"")));
  const box=$("#results"); box.innerHTML="";
  const f={airport:code,airline:t.airline,alliance:allianceOf(t.airline),cabin:t.cabin,intl:t.trip==="intl",dir:t.dir};
  const res=evaluate(f);
  const yes=res.filter(r=>r.status==="yes"), warn=res.filter(r=>r.status==="warn"), no=res.filter(r=>r.status==="no");
  const n=yes.length+warn.length;
  box.appendChild(h("h2",{class:"verdict"}, yes.length ? "You can use "+yes.length+" lounge"+(yes.length>1?"s":"")+" at "+code : warn.length ? "You may get in at "+code : "No lounges for this trip",
    h("small",null, n ? "Tap a lounge to see what to bring and any time limits." : (R.airports[code]?"Open the list below to see what would get you in.":"We don't list individual lounges at "+code+" yet. Card and status lounges still show here when they apply."))));
  const hasPP=ppSources().length>0;
  if(hasPP&&ppScanned(code)&&!res.some(r=>r.key==="prioritypass")) box.appendChild(h("div",{class:"ppnote"},"No Priority Pass lounges at "+code+" (checked "+fmtDate(NET("prioritypass").venuesChecked||NET("prioritypass").verified||"")+")."));
  if(yes.length){ box.appendChild(h("div",{class:"group-h ok"},"You're in")); box.appendChild(h("div",{class:"list"},yes.map(card))); }
  if(warn.length){ box.appendChild(h("div",{class:"group-h warn"},"Check the details")); box.appendChild(h("div",{class:"list"},warn.map(card))); }
  if(!n&&!no.length) box.appendChild(h("div",{class:"empty"},h("b",null,"Nothing to show"),profileEmpty()?"Add your cards and status first.":"Try your airline's app for lounges here."));
  if(no.length) box.appendChild(h("details",{class:"nope"},h("summary",null,h("span",null,"Lounges you can't use ("+no.length+")"),h("span",{"aria-hidden":"true"},"▾")),h("div",{class:"list"},no.map(card))));
  // open the first usable lounge so the details are visible right away
  const first=box.querySelector(".lc.ok .lc-head, .lc.warn .lc-head"); if(first) first.click();
}
function profileEmpty(){return !Object.values(profile.cards).some(Boolean)&&!Object.values(profile.mems).some(Boolean)&&Object.values(profile.status).every(v=>v==="none");}

/* ---------------- Rules freshness ---------------- */
function fmtDate(s){ const d=new Date(String(s).length===10?s+"T12:00:00":s); return isNaN(d)?String(s):d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); }
let fetching=false, fetchNote="";
const RULES_CACHE=LS_KEY+".rules";
function renderFresh(){
  const m=R.meta||{};
  $("#freshDot").className="dot "+(fetching?"busy":rulesSource==="live"?"live":"");
  $("#freshTitle").textContent = fetching ? "Getting the latest rules…" : "Rules updated "+fmtDate(m.updatedAt||"");
  let d = rulesSource==="live" ? "Latest rules loaded." : rulesSource==="saved" ? "Using the rules saved on this iPhone." : "Using the rules built into the app.";
  d+=" Sources are checked daily and researched weekly; new rules load whenever you open the app.";
  if(fetchNote) d+=" "+fetchNote;
  $("#freshDetail").textContent=d;
  const ul=$("#changeList"); ul.innerHTML="";
  (Array.isArray(m.changelog)?m.changelog:[]).slice(0,30).forEach(c=>{ if(c&&c.text) ul.appendChild(h("li",null,(c.date?fmtDate(c.date)+": ":"")+c.text)); });
}
function useRules(d,source){ if(applyRemoteRules(d)){ rulesSource=source; buildAirportList(); if(view==="results") runSearch(); if(view==="home") renderHome(); return true; } return false; }
async function loadRules(){
  if(fetching) return;
  fetching=true; if(view==="home") renderFresh();
  let d=null;
  for(const u of ["https://raw.githubusercontent.com/MoveBeyondFPTP/lounge-finder/main/rules.json?t="+Date.now(),"rules.json?t="+Date.now()]){
    try{ const r=await fetch(u,{cache:"no-store"}); if(r.ok){ d=await r.json(); break; } }catch(e){}
  }
  const before=(R.meta&&R.meta.updatedAt)||"";
  if(d&&useRules(d,"live")){ try{localStorage.setItem(RULES_CACHE,JSON.stringify(d))}catch(e){} fetchNote=""; if(before&&String(d.meta.updatedAt)>before) toast("Rules updated"); }
  else fetchNote="Couldn't reach the internet, so the last saved rules are shown.";
  fetching=false; if(view==="home") renderFresh();
}
function buildAirportList(){const dl=$("#airportList"); dl.innerHTML=""; Object.keys(R.airports).sort().forEach(c=>dl.appendChild(h("option",{value:c},R.airports[c])));}

/* ---------------- Start ---------------- */
const asel=$("#airline"); AIRLINES.forEach(([c,n,al])=>asel.appendChild(h("option",{value:c},n+(al?" · "+ALLIANCE_NAME[al]:""))));
try{ const c=JSON.parse(localStorage.getItem(RULES_CACHE)||"null"); if(c&&c.meta&&String(c.meta.updatedAt||"")>=String(R.meta.updatedAt||"")) { applyRemoteRules(c); rulesSource="saved"; } }catch(e){}
buildAirportList();
if(!profile.onboarded && profileEmpty()){ view="setup"; $("#v-setup").hidden=false; renderWizard(); }
else { profile.onboarded=true; go("home"); }
loadRules();
let hiddenAt=0;
document.addEventListener("visibilitychange",()=>{ if(document.hidden) hiddenAt=Date.now(); else if(Date.now()-hiddenAt>60*1000) loadRules(); });
if("serviceWorker" in navigator){ window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{})); }

})();
