
## Todo
- [ ] Charts for clan stats
- [ ] Add API status with information on last successful sync
  - [x] Store connection sessions to API (back)
  - [ ] Add `/status` endpoint (back)
  - [ ] Display status in the app (front)
- [ ] Add 'Best' column to player's seasons in clan (back)
- [ ] Show last changes on a player
- [ ] Add a db lock for sync with API
- [ ] Make all refrashable components to be actually refreshable (front)
- [x] Migrate all CSS to styled components
- [ ] define donation reset time as a setting (should be every Monday at 00:00 UTC)
- [ ] Decouple from Bootstrap
- [x] Add a 'Report' tab to ClanPage to contain information about who should be kicked, promoted, demoted (-> app settings or db record for configuration)
- [ ] Change the "Players" counter on clan page to include recently joined/left members, show details in a tooltip
- [x] Add war outcome to ClanMembersTable

- [ ] Authentication

#### Link db users with game users (safely)
Possible solution:
> Play a Ladder battle with the following deck : \*randomly generated deck OR player's main deck\*
- [ ] Random deck generator (based on player's best cards?)
- [ ] deck serializer / deserializer with card ids (need to store the deck "challenge")
