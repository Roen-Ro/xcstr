# xcstr
Find replace specific (regular expression) string in objc or swift files for ios or mac developers
1. 找出 xcode 项目中的中文 (`imageNamed:@"中文"` 的内容不提取)
2. 将提1中取中文内容替换成 `NSLocalizedString(@“中文”,nil)` ，(原本包含在 `NSLocalizedString(@“中文”,...)` 、 `LSTRING(@"中文")` 的中文，仅提取不做替换)
3. 将1中提取的中文做去重后，写到文件"localizedstring_zh_xcstr.strings"中

