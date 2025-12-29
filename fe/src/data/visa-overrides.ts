export const visaOverrides: Record<string, any> = {
  // Student visa (500): make Study step include tuition deposit estimate and bump costs
  '500': {
    phases: {
      before: {
        modifySteps: {
          study: {
            // set cost range to include tuition deposit / course cost estimate
            costAud: '5,000-15,000',
            // append a detail explaining tuition deposit
            detailsPatch: [
              { label: 'tuition-deposit', desc: 'Deposit học phí / học tập (ước lượng)', cost: '5,000-15,000' }
            ]
          }
        }
      }
    }
  },

  // Work & Holiday (462): mark study step as optional / keep low costs
  '462': {
    phases: {
      before: {
        modifySteps: {
          study: {
            costAud: '0-500',
            detailsPatch: [
              { label: 'note-462', desc: 'Work & Holiday thường không yêu cầu học chính thức — chọn trường là tùy chọn', cost: '0' }
            ]
          }
        }
      }
    }
  },

  // Temporary Skill Shortage (482): add pre-employment checks / training cost
  '482': {
    phases: {
      before: {
        modifySteps: {
          travel: {
            detailsPatch: [
              { label: 'training', desc: 'Pre-employment training / police check for skilled role', cost: '100-500' }
            ]
          }
        }
      }
    }
  }
}
