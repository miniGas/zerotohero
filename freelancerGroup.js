const { Identity } = require("@semaphore-protocol/identity");
const supabase = require("./utils/supabaseClient");
const { getRoot } = require("./utils/useSemaphore");
const { getGroup, getMembersGroup } = require("./utils/bandadaApi");
const { Group } = require("@semaphore-protocol/group");

async function joinCredentialGroup(groupId, bandadaDashboardUrl, appUrl) {
  const identity = new Identity("0xA5b71068da164ECafAB295838f775Fe90764f786");
  console.log("Identity:", identity.toString());

  const group = await getGroup(groupId);
  if (!group) {
    console.error("Group not found!");
    return;
  }
  console.log("Group info is:", group);

  const providerName = group.credentials.id.split("_")[0].toLowerCase();
  console.log("Provider Name is:", providerName);

  const commitment = identity.getCommitment().toString();
  console.log("Commitment is:", commitment);

  const credentialUrl = `${bandadaDashboardUrl}/credentials?group=${groupId}&member=${commitment}&provider=${providerName}&redirect_uri=${appUrl}`;
  console.log(
    "Please visit the following URL to join the group:",
    credentialUrl
  );

  const commitment2 = identity.commitment.toString();
  console.log("Commitment2 is:", commitment2);

  const group2 = await getGroup(groupId);
  const providerName2 = group.credentials.id.split("_")[0].toLowerCase();
  console.log("Provider Name2 is:", providerName2);

  const credentialUrl2 = `${bandadaDashboardUrl}/credentials?group=${groupId}&member=${commitment2}&provider=${providerName2}&redirect_uri=${appUrl}/groups?redirect=true`;

  console.log(
    "Please visit the following URL2 to join the group:",
    credentialUrl2
  );

  const groupRoot = await getRoot(groupId, group2.treeDepth, group2.members);
  console.log("Group Root is:", groupRoot.toString());

  const { error } = await supabase
    .from("root_history")
    .insert([{ root: groupRoot.toString() }]);
  if (error) {
    console.error("Error inserting group root:", error);
    return;
  }

  const users = await getMembersGroup(groupId);
  console.log("group users is:", users);
  const semaphoreGroup = new Group(groupId, 16, users);
  console.log(semaphoreGroup);
}

const GROUP_ID = "34542554362187573382361346043900";
const BANDADA_DASHBOARD_URL = "https://bandada.pse.dev";
const APP_URL = "https://credential-bandada-semaphore.vercel.app";

joinCredentialGroup(GROUP_ID, BANDADA_DASHBOARD_URL, APP_URL).catch(
  console.error
);
