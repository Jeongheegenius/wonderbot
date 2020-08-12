module.exports.execute = async (
    client,
    message
) => {
    if(!message.data.args) return message.reply('\n**원더봇 채팅 청소기능**\n\n다음 예시와 같이 사용하실 수 있습니다!\n```yml\n{prefix}청소 3\n{prefix}청소 @유저1 @유저2 @역할1\n{prefix}청소 @유저1 @역할1 3\n{prefix}청소 포함하는키워드\n{prefix}청소 /(정규*)?표현식\\W+/```'.bind({ prefix: message.data.prefix }))
    let last = Number(message.data.args.split(' ').pop())
    let filtered = await message.channel.messages.fetch({ limit: 100, before: message.id, filterOld: true })
    if(message.data.args.match(/\/(.*?)\/(\w+)?/)) {
        const val = message.data.args.match(/\/(.*?)\/(\w+)?/)
        const [ exp, flag ] = [ val[1], val[2] ]
        try {
            filtered = filtered.filter(m=> m.content.replace(new RegExp(exp, flag), '') === '')

        } catch(e) {
            return message.reply(`정규표현식을 처리하는데 오류가 발생하였습니다\n\`\`\`js\n${e}\`\`\``)
        }
    } else if (!message.data.arg[1] && isNum(message.data.arg[0])) {
        last = message.data.arg[0]
    } else if (message.mentions.members.size !== 0 || message.mentions.roles.size !== 0) {
        filtered = filtered.filter(m=> message.mentions.members.map(m=>m.id).includes(m.author.id) || message.mentions.roles.map(m=>m.id).map(e=> m.member.roles.cache.map(r=>r.id).includes(e)).includes(true))
    } 
    else {
        const content = isNum(last) ? message.data.args.split(' ').slice(0,  message.data.args.split(' ').length-1).join(' ') : message.data.args
        filtered = filtered.filter(m=> m.content.includes(content))
    }
    await message.channel.bulkDelete(isNum(last) ? filtered.array().slice(0, last) : filtered)
        .then(r=> message.reply(`> 🚮 **${r.size}**개의 메세지를 정리했습니다.`))
        .catch(e=> console.error(e))
    await message.delete()
}

module.exports.props = {
    name: 'clear',
    perms: 'general',
    alias: ['clean', '청소', '채팅청소', '정리'],
    args: [
        {
            name: 'option',
            type: 'option',
            required: true,
            options: ['수량', '유저', '역할', '/정규표현식/(플래그)']
        },
        {
            name: 'count',
            type: 'number',
            required: false
        }
    ]
}


function isNum(n){
    return !isNaN(Number(n)) && Number.isInteger(Number(n))
}