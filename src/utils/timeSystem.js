//时间系统工具
export class TimeSystem {
    constructor() {
        this.currentTime = 0;
        this.updateInterval = null;
    }

    //获取当前时间
    getCurrentTime() {
        return new Date()
    }

    //获取当前小时
    getCurrentHour() {
        return this.getCurrentTime().getHours()
    }

    //判断时间段
    getTimePeriod(){
        const hour = this.getCurrentHour()

        if (hour >= 5 && hour < 12) {
            return 'morning'
        } else if (hour >= 12 && hour < 18) {
            return 'afternoon'
        } else if (hour >= 18 && hour < 22) {
            return 'evening'
        } else {
            return 'night'
        }
    }

    //获取时间段的中文名称
    getTimePeriodName(){
        const period = this.getTimePeriod()
        const names = {
            morning: '早上',
            afternoon: '下午',
            evening: '晚上',
            night: '深夜'
        }
        return names[period] || '未知'
    }

    //获取时间问候语
    getTimeGreeting(characterId = 'kuro'){
        const period = this.getTimePeriod()

        const greetings = {
            kuro:{
                morning: [
                    '哼...这么早就来找我了？',
                    '早上好，人类。虽然我不太想承认，但确实是个不错的开始。',
                    '又是新的一天...希望今天不会太无聊。',
                    '早啊，有什么事吗？'
                ],
                afternoon: [
                    '下午好，有什么需要帮助的吗？',
                    '哼，下午了...时间过得真快。',
                    '下午的阳光还不错，虽然我不太喜欢晒太阳。',
                    '下午好，人类。'
                ],
                evening: [
                    '晚上好，今天过得怎么样？',
                    '哼...晚上到了，我的时间。',
                    '晚上好，有什么想聊的吗？',
                    '夜晚总是让人感到平静...'
                ],
                night: [
                    '这么晚了还不睡？',
                    '深夜了...你确定要在这个时候聊天吗？',
                    '哼，深夜的独处时光被打破了。',
                    '夜深了，人类。'
                ]
            },
            aoba: {
                morning: [
                    '早上好！新的一天开始了呢~',
                    '早安！今天也要充满活力哦！',
                    '早上好，有什么想和我分享的吗？',
                    '新的一天，新的希望！'
                ],
                afternoon: [
                    '下午好！今天过得怎么样？',
                    '下午的阳光真温暖呢~',
                    '下午好，需要我为你加油吗？',
                    '下午了，记得休息一下哦~'
                ],
                evening: [
                    '晚上好！今天辛苦了！',
                    '晚上好，有什么想聊的吗？',
                    '夜晚总是特别温柔呢~',
                    '晚上好，我在这里陪着你~'
                ],
                night: [
                    '夜深了，要注意休息哦~',
                    '这么晚了还不睡吗？',
                    '深夜了，我在这里陪着你~',
                    '夜深了，记得早点休息~'
                ]
            }
        }
        const characterGreetings = greetings[characterId] || greetings.kuro
        const periodGreetings = characterGreetings[period] || characterGreetings.morning
        
        return periodGreetings[Math.floor(Math.random() * periodGreetings.length)]
    }

    //获取时间心情影响
    getTimeMoodEffect(){
        const period = this.getTimePeriod()
    
        const moodEffects = {
            morning: { mood: +5, energy: +10 },
            afternoon: { mood: 0, energy: 0 },
            evening: { mood: +10, energy: -5 },
            night: { mood: -5, energy: -10 }
        }
        return moodEffects[period] || { mood: 0, energy: 0 }
    }

    // 检查是否是特殊时间
    isSpecialTime() {
        const hour = this.getCurrentHour()
        const minute = this.getCurrentTime().getMinutes()
        
        // 特殊时间点
        const specialTimes = [
        { hour: 0, minute: 0, name: '午夜' },
        { hour: 6, minute: 0, name: '日出' },
        { hour: 12, minute: 0, name: '正午' },
        { hour: 18, minute: 0, name: '日落' },
        { hour: 23, minute: 59, name: '深夜' }
        ]
        
        return specialTimes.find(time => 
        time.hour === hour && Math.abs(time.minute - minute) <= 5
        )
    }

    // 获取特殊时间问候
    getSpecialTimeGreeting(characterId = 'kuro') {
        const specialTime = this.isSpecialTime()
        if (!specialTime) return null
        
        const specialGreetings = {
            kuro: {
                '午夜': '午夜了...这个时候总是特别安静。',
                '日出': '哼...又是新的一天开始了。',
                '正午': '正午的阳光真刺眼...',
                '日落': '日落了，一天又要结束了。',
                '深夜': '深夜了，你确定要在这个时候聊天吗？'
            },
            aoba: {
                '午夜': '午夜了！新的一天即将开始呢~',
                '日出': '日出真美！新的一天充满希望！',
                '正午': '正午的阳光真温暖呢~',
                '日落': '日落了，今天辛苦了！',
                '深夜': '夜深了，要注意休息哦~'
            }
        }
        
        const characterSpecial = specialGreetings[characterId] || specialGreetings.kuro
        return characterSpecial[specialTime.name] || null
    }

    // 格式化时间显示
    formatTime() {
        const now = this.getCurrentTime()
        return now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
        })
    }

  // 格式化日期显示
    formatDate() {
        const now = this.getCurrentTime()
        return now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
        })
    }

    // 启动时间更新
    startTimeUpdate(callback) {
        this.updateInterval = setInterval(() => {
            this.currentTime = new Date()
            if (callback) {
                callback({
                    time: this.formatTime(),
                    date: this.formatDate(),
                    period: this.getTimePeriod(),
                    periodName: this.getTimePeriodName(),
                    specialTime: this.isSpecialTime()
                })
            }
        }, 60000) // 每分钟更新一次
    }

  // 停止时间更新
    stopTimeUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval)
            this.updateInterval = null
        }
    }
}
// 创建全局时间系统实例
export const timeSystem = new TimeSystem()