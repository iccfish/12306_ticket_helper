using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;

namespace TicketPackageSyncTool
{
	class Program
	{
		/// <summary>
		/// 当前的根路径
		/// </summary>
		static string _root;
		static string _chromePath;
		static string _output;
		static string[] _updates;
		static string _pluginVersion;

		static void Main(string[] args)
		{

			Console.Title = "12306订票助手文件版本同步工具";
			Console.WriteLine("12306订票助手文件版本同步工具 by iFish(木鱼)");
			Console.WriteLine("  VER. " + System.Diagnostics.FileVersionInfo.GetVersionInfo(System.Reflection.Assembly.GetEntryAssembly().Location).FileVersion);
			Console.WriteLine("====================================================");
			Console.WriteLine();

			_root = GetContainingFolder();
			Console.WriteLine("[INFO] 项目根目录是 " + _root);

			//获得插件版本
			_pluginVersion = GetVersion();

			//创建输出目录
			_output = CreateOutputDirectory();

			//获得谷歌路径
			_chromePath = GetChromeExePath();

			//复制用户脚本
			GenerateUserScript();

			//谷歌原生扩展
			GenerateChromePack();

			//谷歌应用程序商店
			GenerateWebStorePack();

			//淘宝浏览器专版
			GenerateTaobaoPack(_pluginVersion);

			//猎豹浏览器专版
			GenerateLieBaoPack(_pluginVersion);

			//遨游浏览器扩展
			GenerateMaxthonAddon(_pluginVersion);

			//搜狗浏览器
			GenerateSogouExtension(_pluginVersion);

			//修正更新文件版本号
			FixUpdateXmlVersion(_pluginVersion);

			//更新版本信息js文件
			FixUpdateJsVersion(_pluginVersion);

			//修正说明文件
			FixReadme();


			Console.WriteLine();
			Console.WriteLine("====================================================");
			Console.WriteLine("按任意键退出.....");
			Console.ReadKey();
		}

		/// <summary>
		/// 谷歌应用商店
		/// </summary>
		static void GenerateWebStorePack()
		{
			//搜狗文件目录
			var src = System.IO.Path.Combine(_root, "webstore");
			System.IO.File.Copy(GetOriginalScript(), System.IO.Path.Combine(src, "12306_ticket_helper.user.js"), true);

			Console.WriteLine("[INFO] 正在同步谷歌商店manifest.json版本");
			ModifyManifestVersion(System.IO.Path.Combine(src, "manifest.json"), _pluginVersion);


			//打包
			Console.WriteLine("[INFO] 正在打包应用商店扩展....");
			var tool = System.IO.Path.Combine(_root, "tools\\7z.exe");
			System.Diagnostics.Process.Start(tool, " a  -tZIP \"" + System.IO.Path.Combine(_output, "12306订票助手.zip") + "\" -y " + src + "\\*").WaitForExit();
		}

		/// <summary>
		/// 修正说明文件
		/// </summary>
		static void FixReadme()
		{
			Console.WriteLine("[INFO] 正在修正更新记录.....");
			var readme = System.IO.Path.Combine(_root, "readme.md");
			var lines = System.IO.File.ReadAllLines(readme, System.Text.Encoding.UTF8);

			if (lines.FirstOrDefault(s => s.StartsWith("**版本：" + _pluginVersion)) != null)
			{
				Console.WriteLine("[INFO] 已是最新，不需要修正");
				return;
			}

			//修正
			var dest = new List<string>(lines.Length + _updates.Length + 5);
			var index = 0;
			while (index < lines.Length && lines[index] != "官方网站")
			{
				dest.Add(lines[index++]);
			}
			//加入记录
			dest.Add("**版本：" + _pluginVersion + "**");
			foreach (var item in _updates)
			{
				var u = item.Trim(new[] { ' ', '\t', '\'', '"', ';', ',' });
				if (u.StartsWith("//")) continue;

				//移除html
				u = System.Text.RegularExpressions.Regex.Replace(u, "<[^>]*>", "");
				dest.Add("* " + u);
			}
			dest.Add(Environment.NewLine);
			while (index < lines.Length)
			{
				dest.Add(lines[index++]);
			}
			System.IO.File.WriteAllLines(readme, dest.ToArray(), System.Text.Encoding.UTF8);
			Console.WriteLine("[SUCC] 修正成功");
		}

		/// <summary>
		/// 修正更新文件版本号
		/// </summary>
		/// <param name="version"></param>
		static void FixUpdateXmlVersion(string version)
		{
			var xmls = System.IO.Directory.GetFiles(_root, "update*.xml");
			foreach (var f in xmls)
			{
				Console.WriteLine("[INFO] 修正 " + System.IO.Path.GetFileName(f) + " 中的版本号....");
				ModifyXmlVersion(f, version);
			}
		}

		/// <summary>
		/// 更新版本信息js文件
		/// </summary>
		/// <param name="version"></param>
		static void FixUpdateJsVersion(string version)
		{
			var xmls = System.IO.Directory.GetFiles(_root, "version*.js");
			foreach (var f in xmls)
			{
				Console.WriteLine("[INFO] 修正 " + System.IO.Path.GetFileName(f) + " 中的版本号....");
				ModifyVersionJs(f, version);
			}
		}

		/// <summary>
		/// 搜狗浏览器扩展
		/// </summary>
		/// <param name="version"></param>
		static void GenerateSogouExtension(string version)
		{
			//搜狗文件目录
			var src = System.IO.Path.Combine(_root, "sogou");
			System.IO.File.Copy(GetOriginalScript(), System.IO.Path.Combine(src, "12306_ticket_helper.user.js"), true);

			Console.WriteLine("[INFO] 正在同步搜狗浏览器扩展版本号....");
			//同步版本
			var manifest = System.IO.Path.Combine(src, "manifest.xml");
			System.IO.File.WriteAllText(manifest,
				System.Text.RegularExpressions.Regex.Replace(
				System.IO.File.ReadAllText(manifest, System.Text.Encoding.UTF8),
				@"<version>\s*[\d\.]+\s*</version>",
				"<version>" + version + "</version>")
				, new System.Text.UTF8Encoding(false, true));

			//打包
			Console.WriteLine("[INFO] 正在打包搜狗浏览器扩展....");
			var tool = System.IO.Path.Combine(_root, "tools\\7z.exe");
			System.Diagnostics.Process.Start(tool, " a  -tZIP \"" + System.IO.Path.Combine(_output, "12306订票助手.sext") + "\" -y " + src + "\\*").WaitForExit();
		}

		/// <summary>
		/// 遨游浏览器扩展
		/// </summary>
		/// <param name="version"></param>
		static void GenerateMaxthonAddon(string version)
		{
			//源文件目录
			var src = System.IO.Path.Combine(_root, "src");
			Console.WriteLine("[INFO] 正在同步遨游扩展版本号");
			ModifyManifestVersion(System.IO.Path.Combine(src, "def.json"), version, new System.Text.UnicodeEncoding(false, true));

			//工具目录
			var tool = System.IO.Path.Combine(_root, "tools\\mxpacker.exe");
			Console.WriteLine("[INFO] 正在打包遨游扩展....");
			System.Diagnostics.Process.Start(tool, "\"" + src + "\"").WaitForExit();
			System.IO.File.Move(src + ".mxaddon", System.IO.Path.Combine(_output, "12306订票助手.mxaddon"));
			Console.WriteLine("[INFO] 遨游扩展生成完毕.");
		}

		/// <summary>
		/// 生成淘宝定制版
		/// </summary>
		static void GenerateLieBaoPack(string version)
		{
			//源文件目录
			var src = System.IO.Path.Combine(_root, "src_lb");
			if (!System.IO.Directory.Exists(src)) return;

			//查找KEY文件
			var pem = System.IO.Directory.GetFiles(_root, "*.pem").FirstOrDefault() ?? "";

			Console.WriteLine("[TIP!] 准备生成猎豹浏览器专版，请手动合并区别。完成后，按任意键继续....");
			OpenLocationInExplorer(GetOriginalScript());
			OpenLocationInExplorer(System.IO.Path.Combine(src, "12306_ticket_helper.user.js"));
			Console.ReadKey();

			Console.WriteLine("[INFO] 正在同步manifest.json版本");
			ModifyManifestVersion(System.IO.Path.Combine(src, "manifest.json"), version);

			GenerateChromePack("猎豹浏览器专版", src, pem);
		}

		/// <summary>
		/// 生成淘宝定制版
		/// </summary>
		static void GenerateTaobaoPack(string version)
		{
			//源文件目录
			var src = System.IO.Path.Combine(_root, "src_tb");
			if (!System.IO.Directory.Exists(src)) return;

			//查找KEY文件
			var pem = System.IO.Directory.GetFiles(_root, "*.pem").FirstOrDefault() ?? "";

			Console.WriteLine("[TIP!] 准备生成淘宝浏览器专版，请手动合并区别。完成后，按任意键继续....");
			OpenLocationInExplorer(GetOriginalScript());
			OpenLocationInExplorer(System.IO.Path.Combine(src, "12306_ticket_helper.user.js"));
			Console.ReadKey();

			Console.WriteLine("[INFO] 正在同步manifest.json版本");
			ModifyManifestVersion(System.IO.Path.Combine(src, "manifest.json"), version);

			GenerateChromePack("淘宝浏览器专版", src, pem);
		}

		/// <summary>
		/// 创建谷歌扩展包
		/// </summary>
		/// <returns></returns>
		static void GenerateChromePack()
		{
			//源文件目录
			var src = System.IO.Path.Combine(_root, "src");
			//查找KEY文件
			var pem = System.IO.Directory.GetFiles(_root, "*.pem").FirstOrDefault() ?? "";

			GenerateChromePack("谷歌浏览器", src, pem);
		}

		/// <summary>
		/// 创建谷歌扩展包
		/// </summary>
		/// <returns></returns>
		static void GenerateChromePack(string type, string src, string pem)
		{
			Console.WriteLine("[INFO] 正在打包[" + type + "]扩展....");

			var psi = new System.Diagnostics.ProcessStartInfo(_chromePath, "\"--pack-extension=" + src + "\"" + (string.IsNullOrEmpty(pem) ? "" : " \"--pack-extension-key=" + pem + "\""));
			Console.WriteLine("[INFO] 命令行为 " + psi.Arguments);
			Console.Write("[INFO] 打包中....");
			System.Diagnostics.Process.Start(psi).WaitForExit();
			Console.WriteLine("已完成....");

			var name = System.IO.Path.GetFileName(src);
			System.IO.File.Move(src + ".crx", System.IO.Path.Combine(_output, "12306订票助手(" + type + ").crx"));
			Console.WriteLine("[INFO] 已生成 " + name + ".crx");
		}

		/// <summary>
		/// 复制用户脚本
		/// </summary>
		static void GenerateUserScript()
		{
			var src = GetOriginalScript();
			var dest = System.IO.Path.Combine(_output, "12306_ticket_helper.user.js");

			System.IO.File.Copy(src, dest);
			Console.WriteLine("[INFO] 已经复制用户脚本 12306_ticket_helper.user.js 到目标目录");
		}

		/// <summary>
		/// 创建输出目录
		/// </summary>
		/// <returns></returns>
		static string CreateOutputDirectory()
		{
			var output = System.IO.Path.Combine(_root, "Publish");
			if (System.IO.Directory.Exists(output)) System.IO.Directory.Delete(output, true);

			System.IO.Directory.CreateDirectory(output);
			Console.WriteLine("[INFO] 已经创建输出目录");

			return output;
		}

		/// <summary>
		/// 获得谷歌程序路径
		/// </summary>
		/// <returns></returns>
		static string GetChromeExePath()
		{
			var is64bit = System.Environment.GetEnvironmentVariable("PROCESSOR_ARCHITECTURE") == "AMD64";

			var chromePath = System.IO.Path.Combine(System.Environment.GetEnvironmentVariable(is64bit ? "programfiles(x86)" : "programfiles"), @"Google\Chrome\Application\chrome.exe");
			if (!System.IO.File.Exists(chromePath))
			{
				chromePath = System.Configuration.ConfigurationManager.AppSettings["chromepath"];
			}
			if (string.IsNullOrEmpty(chromePath) || !System.IO.File.Exists(chromePath))
				throw new ApplicationException("[ERROR] 无法获得Chrome的路径！");

			Console.WriteLine("[INFO] Chrome位于 " + chromePath);

			return chromePath;
		}


		/// <summary>
		/// 查找当前项目的根目录
		/// </summary>
		/// <returns></returns>
		static string GetContainingFolder()
		{
			var root = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
			if (System.IO.Directory.Exists(System.IO.Path.Combine(root, ".git"))) return root;

			//当前没有.git目录，尝试查找项目根目录
			var tempRoot = root;
			var lastIndex = 0;
			while ((lastIndex = tempRoot.LastIndexOf("\\")) != -1)
			{
				tempRoot = tempRoot.Substring(0, lastIndex);
				if (System.IO.Directory.Exists(System.IO.Path.Combine(tempRoot, ".git"))) return tempRoot;
			}

			return root;
		}

		/// <summary>
		/// 读取助手的版本，并更新助手信息中的版本号
		/// </summary>
		/// <returns></returns>
		static string GetVersion()
		{
			Console.WriteLine("[INFO] 正在获得助手版本号……");
			var txt = System.IO.File.ReadAllLines(GetOriginalScript(), System.Text.Encoding.UTF8);

			System.Text.RegularExpressions.Match match = null;
			var versionReg = new System.Text.RegularExpressions.Regex(@"var\s+version\s*=\s*['""]([\.\d]+)['""]");
			txt.FirstOrDefault(s => (match = versionReg.Match(s)).Success);
			if (match == null)
			{
				throw new Exception("[ERROR] 无法找到版本标记");
			}

			var version = match.Groups[1].Value;
			Console.WriteLine("[INFO] 版本号为 " + version);
			Console.WriteLine("[INFO] 正在修改助手META区版本号");

			var metaVersionReg = new System.Text.RegularExpressions.Regex(@"^//\s*@version\s*([\d\.]+)");
			for (int i = 0; i < txt.Length; i++)
			{
				match = metaVersionReg.Match(txt[i]);
				if (!match.Success) continue;

				if (match.Groups[1].Value == version)
				{
					Console.WriteLine("[INFO] META区是同步的，不需要修改");
				}
				else
				{
					Console.WriteLine("[SUCC] 已同步版本号");
					txt[i] = "// @version 		" + version;
					System.IO.File.WriteAllLines(GetOriginalScript(), txt, System.Text.Encoding.UTF8);
				}
				break;
			}

			Console.WriteLine("[INFO] 正在同步manifest.json中的文件版本");
			ModifyManifestVersion(System.IO.Path.Combine(_root, "src\\manifest.json"), version);

			//查找更新
			var start = 0;
			var end = 0;
			while (start < txt.Length && txt[start] != "var updates = [")
			{
				start++;
			}
			if (txt[start] != "var updates = [") throw new ApplicationException("未能找到更新开始标记！");
			end = start + 1;
			while (end < txt.Length && txt[end] != "];")
			{
				if (txt[end][0] != '\t' && txt[end][0] != ' ') throw new ApplicationException("查找更新时发生错误，更新区内容缩进不是空格或tab。");
				end++;
			}
			if (txt[end] != "];") throw new ApplicationException("未能找到更新结束标记！");
			_updates = txt.Skip(start + 1).Take(end - start - 1).ToArray();

			Console.WriteLine("============更新如下===========");
			Console.WriteLine(string.Join(Environment.NewLine, _updates));
			Console.WriteLine("==============================");

			return version;
		}

		static string GetOriginalScript()
		{
			return System.IO.Path.Combine(_root, "src\\12306_ticket_helper.user.js");
		}

		/// <summary>
		/// 在资源管理器中打开指定位置
		/// </summary>
		/// <param name="path">路径</param>
		public static void OpenLocationInExplorer(string path)
		{
			System.Diagnostics.Process.Start("explorer.exe", "/select,\"" + path + "\"");
		}

		/// <summary>
		/// 修改指定清单的版本
		/// </summary>
		/// <param name="filePath"></param>
		/// <param name="version"></param>
		public static void ModifyManifestVersion(string filePath, string version)
		{
			ModifyManifestVersion(filePath, version, System.Text.Encoding.UTF8);
		}

		/// <summary>
		/// 修改指定清单的版本
		/// </summary>
		/// <param name="filePath"></param>
		/// <param name="version"></param>
		public static void ModifyManifestVersion(string filePath, string version, System.Text.Encoding encoding)
		{
			var manifest = System.IO.File.ReadAllText(filePath, encoding);
			manifest = System.Text.RegularExpressions.Regex.Replace(
				manifest,
				@"[""']version[""']\s*:\s*['""][\.\d+]+['""]",
				"\"version\": \"" + version + "\""
				 );
			System.IO.File.WriteAllText(filePath, manifest, encoding);
		}

		/// <summary>
		/// 修改指定清单的版本
		/// </summary>
		/// <param name="filePath"></param>
		/// <param name="version"></param>
		public static void ModifyXmlVersion(string filePath, string version)
		{
			ModifyXmlVersion(filePath, version, System.Text.Encoding.UTF8);
		}

		/// <summary>
		/// 修改指定清单的版本
		/// </summary>
		/// <param name="filePath"></param>
		/// <param name="version"></param>
		public static void ModifyXmlVersion(string filePath, string version, System.Text.Encoding encoding)
		{
			var manifest = System.IO.File.ReadAllText(filePath, encoding);
			manifest = System.Text.RegularExpressions.Regex.Replace(
				manifest,
				@"version=\s*['""][\.\d+]+['""]",
				"version=\"" + version + "\""
				 );
			System.IO.File.WriteAllText(filePath, manifest, encoding);
		}

		/// <summary>
		/// 更新版本JS文件
		/// </summary>
		/// <param name="filepath"></param>
		/// <param name="version"></param>
		static void ModifyVersionJs(string filepath, string version)
		{
			var result = new List<string>();
			result.Add("var version_12306_helper = \"" + version + "\";");
			result.Add("var version_updater = [");
			result.AddRange(_updates);
			result.Add("];");
			result.AddRange(System.IO.File.ReadAllLines(System.IO.Path.Combine(_root, "sysmessage.js")));
			System.IO.File.WriteAllLines(filepath, result.ToArray());
		}
	}
}
