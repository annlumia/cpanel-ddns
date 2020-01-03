
const api = require('./api')
const config = require("./config");


async function main() {

  api.init(config.CPANEL_BASEURL)
  const { security_token } = await api.login(config.CPANEL_USER, config.CPANEL_PWD)
  const payload = await api.fetchZone(security_token, config.DOMAIN)

  if(payload && payload.cpanelresult && payload.cpanelresult.data && payload.cpanelresult.data.length >0 ) {
    const zones = payload.cpanelresult.data[0]
    const zone = zones.record.filter(z => z.name === config.SUBDOMAIN.toLocaleLowerCase() + '.')
    if(Array.isArray(zone) && zone.length > 0) {
      let data = {
        domain: config.DOMAIN,
        ...zone[0]
      }
      data.address = await api.getMyIP()

      const res = await api.patchDNS(security_token, data)
      if(res.cpanelresult.event.result) {
        console.log('Patching DNS successfull :-)')
      } else {
        console.log('Patching Failed :-(\nReason unknown.')
      }

    } else {
      console.log('Patching DNS failed, Subdomain not found!')
    }
  } else {
    console.log('Patching DNS failed, Domain not found!')
  }
}

main();
